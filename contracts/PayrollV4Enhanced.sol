// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PayrollV4Enhanced
 * @notice Enhanced payroll contract with scheduling, automation, and employee portal
 * @dev Supports recurring payments, payment schedules, and employee self-service
 */
contract PayrollV4Enhanced {
    address public owner;
    IERC20 public usdc;
    
    struct Employee {
        uint256 salary;
        string name;
        string role;
        bool isActive;
        bool hasOptedIn; // Employee consent to view their payment data
        uint256 hireDate;
        uint256 totalPaid;
    }
    
    struct PaymentSchedule {
        uint256 amount;
        uint256 nextPaymentDate;
        uint256 frequency; // in seconds (e.g., 30 days = 2592000)
        bool isActive;
        bool isRecurring;
        uint256 totalPayments; // 0 = unlimited
        uint256 paymentsMade;
        string description;
    }
    
    struct PaymentRecord {
        address employee;
        uint256 amount;
        uint256 timestamp;
        string note;
        bool isScheduled;
    }
    
    // State variables
    mapping(address => Employee) public employees;
    address[] public employeeList;
    mapping(address => PaymentSchedule) public paymentSchedules;
    mapping(address => PaymentRecord[]) public employeePaymentHistory;
    PaymentRecord[] public allPayments;
    
    // Privacy features (for future Arc privacy integration)
    mapping(address => bool) public privacyEnabled;
    
    // Events
    event EmployeeAdded(address indexed employee, uint256 salary, string name, string role, uint256 hireDate);
    event EmployeeUpdated(address indexed employee, uint256 newSalary);
    event EmployeeRemoved(address indexed employee);
    event SalaryPaid(address indexed employee, uint256 amount, uint256 timestamp, bool isScheduled);
    event ContractFunded(address indexed funder, uint256 amount);
    event ScheduleCreated(address indexed employee, uint256 amount, uint256 nextPayment, uint256 frequency, string description);
    event ScheduleUpdated(address indexed employee, bool isActive);
    event ScheduledPaymentProcessed(address indexed employee, uint256 amount, uint256 timestamp);
    event EmployeeOptedIn(address indexed employee, bool optedIn);
    event PrivacyToggled(address indexed employee, bool enabled);
    event BulkPaymentExecuted(uint256 totalAmount, uint256 employeeCount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized: Only owner");
        _;
    }
    
    modifier onlyOwnerOrEmployee() {
        require(msg.sender == owner || employees[msg.sender].isActive, "Not authorized");
        _;
    }
    
    modifier employeeExists(address emp) {
        require(employees[emp].salary > 0, "Employee does not exist");
        _;
    }
    
    constructor(address _owner, address _usdc) {
        require(_owner != address(0), "Invalid owner address");
        require(_usdc != address(0), "Invalid USDC address");
        owner = _owner;
        usdc = IERC20(_usdc);
    }
    
    // ============================================
    // EMPLOYEE MANAGEMENT
    // ============================================
    
    /**
     * @notice Add or update an employee
     * @param emp Employee wallet address
     * @param amount Salary amount in USDC (6 decimals)
     * @param name Employee name
     * @param role Employee role/position
     */
    function setSalary(
        address emp,
        uint256 amount,
        string memory name,
        string memory role
    ) external onlyOwner {
        require(emp != address(0), "Invalid employee address");
        require(amount > 0, "Salary must be greater than 0");
        require(bytes(name).length > 0, "Name required");
        require(bytes(role).length > 0, "Role required");
        
        bool isNewEmployee = employees[emp].salary == 0;
        
        if (isNewEmployee) {
            employeeList.push(emp);
            employees[emp].hireDate = block.timestamp;
        }
        
        employees[emp].salary = amount;
        employees[emp].name = name;
        employees[emp].role = role;
        employees[emp].isActive = true;
        
        if (isNewEmployee) {
            emit EmployeeAdded(emp, amount, name, role, block.timestamp);
        } else {
            emit EmployeeUpdated(emp, amount);
        }
    }
    
    /**
     * @notice Remove/deactivate an employee
     * @param emp Employee address to remove
     */
    function removeEmployee(address emp) external onlyOwner employeeExists(emp) {
        require(employees[emp].isActive, "Employee already inactive");
        employees[emp].isActive = false;
        
        // Deactivate their schedule if exists
        if (paymentSchedules[emp].isActive) {
            paymentSchedules[emp].isActive = false;
        }
        
        emit EmployeeRemoved(emp);
    }
    
    /**
     * @notice Employee opts in/out of viewing their payment data
     * @dev Only the employee can toggle their own opt-in status
     */
    function toggleEmployeeOptIn() external {
        require(employees[msg.sender].isActive, "Not an active employee");
        employees[msg.sender].hasOptedIn = !employees[msg.sender].hasOptedIn;
        emit EmployeeOptedIn(msg.sender, employees[msg.sender].hasOptedIn);
    }
    
    /**
     * @notice Toggle privacy mode for employee (Arc privacy feature)
     * @dev Placeholder for Arc's future privacy protocol integration
     */
    function togglePrivacy() external {
        require(employees[msg.sender].isActive, "Not an active employee");
        privacyEnabled[msg.sender] = !privacyEnabled[msg.sender];
        emit PrivacyToggled(msg.sender, privacyEnabled[msg.sender]);
    }
    
    // ============================================
    // FUNDING
    // ============================================
    
    /**
     * @notice Fund the payroll contract with USDC
     * @param amount Amount of USDC to transfer (6 decimals)
     */
    function fundContract(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit ContractFunded(msg.sender, amount);
    }
    
    // ============================================
    // PAYMENT SCHEDULING
    // ============================================
    
    /**
     * @notice Create a payment schedule for an employee
     * @param emp Employee address
     * @param amount Payment amount per cycle
     * @param startDate Timestamp for first payment
     * @param frequency Time between payments in seconds (e.g., 2592000 = 30 days)
     * @param isRecurring Whether payments repeat automatically
     * @param totalPayments Total number of payments (0 = unlimited for recurring)
     * @param description Schedule description
     */
    function createPaymentSchedule(
        address emp,
        uint256 amount,
        uint256 startDate,
        uint256 frequency,
        bool isRecurring,
        uint256 totalPayments,
        string memory description
    ) external onlyOwner employeeExists(emp) {
        require(employees[emp].isActive, "Employee not active");
        require(amount > 0, "Amount must be greater than 0");
        require(startDate >= block.timestamp, "Start date must be in future");
        require(!isRecurring || frequency > 0, "Recurring payments need frequency > 0");
        
        paymentSchedules[emp] = PaymentSchedule({
            amount: amount,
            nextPaymentDate: startDate,
            frequency: frequency,
            isActive: true,
            isRecurring: isRecurring,
            totalPayments: totalPayments,
            paymentsMade: 0,
            description: description
        });
        
        emit ScheduleCreated(emp, amount, startDate, frequency, description);
    }
    
    /**
     * @notice Pause a payment schedule
     * @param emp Employee address
     */
    function pauseSchedule(address emp) external onlyOwner {
        require(paymentSchedules[emp].isActive, "Schedule not active");
        paymentSchedules[emp].isActive = false;
        emit ScheduleUpdated(emp, false);
    }
    
    /**
     * @notice Resume a paused payment schedule
     * @param emp Employee address
     */
    function resumeSchedule(address emp) external onlyOwner {
        require(!paymentSchedules[emp].isActive, "Schedule already active");
        require(employees[emp].isActive, "Employee not active");
        require(paymentSchedules[emp].amount > 0, "No schedule exists");
        paymentSchedules[emp].isActive = true;
        emit ScheduleUpdated(emp, true);
    }
    
    /**
     * @notice Update an existing payment schedule
     * @param emp Employee address
     * @param amount New payment amount (0 to keep current)
     * @param frequency New frequency (0 to keep current)
     * @param description New description (empty to keep current)
     */
    function updateSchedule(
        address emp,
        uint256 amount,
        uint256 frequency,
        string memory description
    ) external onlyOwner {
        require(paymentSchedules[emp].amount > 0, "No schedule exists");
        
        if (amount > 0) {
            paymentSchedules[emp].amount = amount;
        }
        if (frequency > 0) {
            paymentSchedules[emp].frequency = frequency;
        }
        if (bytes(description).length > 0) {
            paymentSchedules[emp].description = description;
        }
    }
    
    // ============================================
    // PAYMENT PROCESSING
    // ============================================
    
    /**
     * @notice Process all due scheduled payments
     * @dev Processes payments for all employees with due schedules
     * @return processed Number of payments processed
     */
    function processDuePayments() external onlyOwner returns (uint256 processed) {
        processed = 0;
        
        for (uint256 i = 0; i < employeeList.length; i++) {
            address emp = employeeList[i];
            
            if (isPaymentDue(emp)) {
                _processScheduledPayment(emp);
                processed++;
            }
        }
        
        require(processed > 0, "No due payments to process");
    }
    
    /**
     * @notice Process payment for a specific employee if due
     * @param emp Employee address
     */
    function processEmployeePayment(address emp) external onlyOwner {
        require(isPaymentDue(emp), "Payment not due yet");
        _processScheduledPayment(emp);
    }
    
    /**
     * @notice Internal function to process a scheduled payment
     * @param emp Employee address
     */
    function _processScheduledPayment(address emp) internal {
        PaymentSchedule storage schedule = paymentSchedules[emp];
        require(schedule.isActive, "Schedule not active");
        require(employees[emp].isActive, "Employee not active");
        
        uint256 amount = schedule.amount;
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC balance");
        
        // Process payment
        require(usdc.transfer(emp, amount), "Payment transfer failed");
        
        // Update employee total
        employees[emp].totalPaid += amount;
        
        // Record payment
        PaymentRecord memory record = PaymentRecord({
            employee: emp,
            amount: amount,
            timestamp: block.timestamp,
            note: string(abi.encodePacked("Scheduled: ", schedule.description)),
            isScheduled: true
        });
        
        allPayments.push(record);
        employeePaymentHistory[emp].push(record);
        schedule.paymentsMade++;
        
        // Update next payment date
        if (schedule.isRecurring) {
            schedule.nextPaymentDate = block.timestamp + schedule.frequency;
            
            // Check if reached total payments limit
            if (schedule.totalPayments > 0 && schedule.paymentsMade >= schedule.totalPayments) {
                schedule.isActive = false;
            }
        } else {
            schedule.isActive = false;
        }
        
        emit ScheduledPaymentProcessed(emp, amount, block.timestamp);
        emit SalaryPaid(emp, amount, block.timestamp, true);
    }
    
    /**
     * @notice Pay a single employee their salary manually
     * @param emp Employee address
     */
    function paySalary(address emp) external onlyOwner employeeExists(emp) {
        require(employees[emp].isActive, "Employee not active");
        uint256 amount = employees[emp].salary;
        require(amount > 0, "No salary set");
        require(usdc.balanceOf(address(this)) >= amount, "Insufficient USDC balance");
        require(usdc.transfer(emp, amount), "Payment transfer failed");
        
        employees[emp].totalPaid += amount;
        
        PaymentRecord memory record = PaymentRecord({
            employee: emp,
            amount: amount,
            timestamp: block.timestamp,
            note: string(abi.encodePacked("Manual payment to ", employees[emp].name)),
            isScheduled: false
        });
        
        allPayments.push(record);
        employeePaymentHistory[emp].push(record);
        emit SalaryPaid(emp, amount, block.timestamp, false);
    }
    
    /**
     * @notice Pay all active employees their salaries
     * @dev Processes payments in a single transaction
     */
    function payAllSalaries() external onlyOwner {
        uint256 totalAmount = 0;
        uint256 employeeCount = 0;
        
        for (uint256 i = 0; i < employeeList.length; i++) {
            address emp = employeeList[i];
            if (employees[emp].isActive && employees[emp].salary > 0) {
                uint256 amount = employees[emp].salary;
                if (usdc.balanceOf(address(this)) >= amount) {
                    usdc.transfer(emp, amount);
                    employees[emp].totalPaid += amount;
                    
                    PaymentRecord memory record = PaymentRecord({
                        employee: emp,
                        amount: amount,
                        timestamp: block.timestamp,
                        note: "Bulk payment",
                        isScheduled: false
                    });
                    
                    allPayments.push(record);
                    employeePaymentHistory[emp].push(record);
                    emit SalaryPaid(emp, amount, block.timestamp, false);
                    
                    totalAmount += amount;
                    employeeCount++;
                }
            }
        }
        
        require(employeeCount > 0, "No employees paid");
        emit BulkPaymentExecuted(totalAmount, employeeCount);
    }
    
    // ============================================
    // VIEW FUNCTIONS - PUBLIC
    // ============================================
    
    /**
     * @notice Get all employee addresses
     */
    function viewEmployees() external view returns (address[] memory) {
        return employeeList;
    }
    
    /**
     * @notice Get employee details
     * @param emp Employee address
     */
    function getEmployee(address emp) external view returns (
        uint256 salary,
        string memory name,
        string memory role,
        bool isActive,
        bool hasOptedIn,
        uint256 hireDate,
        uint256 totalPaid
    ) {
        Employee memory e = employees[emp];
        return (e.salary, e.name, e.role, e.isActive, e.hasOptedIn, e.hireDate, e.totalPaid);
    }
    
    /**
     * @notice Get contract's USDC balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdc.balanceOf(address(this));
    }
    
    /**
     * @notice Get total monthly salary expense for active employees
     */
    function getTotalSalaryExpense() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (employees[employeeList[i]].isActive) {
                total += employees[employeeList[i]].salary;
            }
        }
        return total;
    }
    
    /**
     * @notice Check if a payment is due for an employee
     * @param emp Employee address
     */
    function isPaymentDue(address emp) public view returns (bool) {
        PaymentSchedule memory schedule = paymentSchedules[emp];
        return schedule.isActive && 
               employees[emp].isActive && 
               block.timestamp >= schedule.nextPaymentDate;
    }
    
    /**
     * @notice Get all employees with due payments
     */
    function getDuePayments() external view returns (address[] memory) {
        uint256 dueCount = 0;
        
        // Count due payments
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (isPaymentDue(employeeList[i])) {
                dueCount++;
            }
        }
        
        // Build result array
        address[] memory due = new address[](dueCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < employeeList.length; i++) {
            if (isPaymentDue(employeeList[i])) {
                due[index] = employeeList[i];
                index++;
            }
        }
        
        return due;
    }
    
    /**
     * @notice Get total number of payment records
     */
    function getTotalPayments() external view returns (uint256) {
        return allPayments.length;
    }
    
    // ============================================
    // VIEW FUNCTIONS - EMPLOYEE PORTAL
    // ============================================
    
    /**
     * @notice Get employee's payment schedule (Owner or opted-in employee only)
     * @param emp Employee address
     */
    function getEmployeeSchedule(address emp) external view returns (
        uint256 amount,
        uint256 nextPaymentDate,
        uint256 frequency,
        bool isActive,
        bool isRecurring,
        uint256 totalPayments,
        uint256 paymentsMade,
        string memory description
    ) {
        require(
            msg.sender == owner || (msg.sender == emp && employees[emp].hasOptedIn),
            "Not authorized to view schedule"
        );
        
        PaymentSchedule memory s = paymentSchedules[emp];
        return (
            s.amount,
            s.nextPaymentDate,
            s.frequency,
            s.isActive,
            s.isRecurring,
            s.totalPayments,
            s.paymentsMade,
            s.description
        );
    }
    
    /**
     * @notice Get employee's payment history (Owner or opted-in employee only)
     * @param emp Employee address
     * @param startIndex Starting index for pagination
     * @param count Number of records to return
     */
    function getEmployeePaymentHistory(address emp, uint256 startIndex, uint256 count) 
        external 
        view 
        returns (PaymentRecord[] memory) 
    {
        require(
            msg.sender == owner || (msg.sender == emp && employees[emp].hasOptedIn),
            "Not authorized to view history"
        );
        
        PaymentRecord[] storage history = employeePaymentHistory[emp];
        if (history.length == 0 || startIndex >= history.length) {
            return new PaymentRecord[](0);
        }
        
        uint256 end = startIndex + count;
        if (end > history.length) {
            end = history.length;
        }
        
        uint256 resultCount = end - startIndex;
        PaymentRecord[] memory result = new PaymentRecord[](resultCount);
        
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = history[startIndex + i];
        }
        
        return result;
    }
    
    /**
     * @notice Get total number of payments for an employee
     * @param emp Employee address
     */
    function getEmployeeTotalPayments(address emp) external view returns (uint256) {
        require(
            msg.sender == owner || (msg.sender == emp && employees[emp].hasOptedIn),
            "Not authorized"
        );
        return employeePaymentHistory[emp].length;
    }
    
    /**
     * @notice Get global payment history (Owner only, paginated)
     * @param startIndex Starting index
     * @param count Number of records
     */
    function getPaymentHistory(uint256 startIndex, uint256 count) 
        external 
        view 
        onlyOwner
        returns (PaymentRecord[] memory) 
    {
        if (allPayments.length == 0 || startIndex >= allPayments.length) {
            return new PaymentRecord[](0);
        }
        
        uint256 end = startIndex + count;
        if (end > allPayments.length) {
            end = allPayments.length;
        }
        
        uint256 resultCount = end - startIndex;
        PaymentRecord[] memory result = new PaymentRecord[](resultCount);
        
        // Return in reverse order (most recent first)
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = allPayments[allPayments.length - 1 - (startIndex + i)];
        }
        
        return result;
    }
}

/**
 * @title PayrollFactoryV4
 * @notice Factory contract to create and manage multiple payroll contracts
 */
contract PayrollFactoryV4 {
    address public immutable usdcAddress;
    
    struct PayrollInfo {
        address payrollContract;
        address owner;
        uint256 createdAt;
        string companyName;
    }
    
    mapping(address => PayrollInfo[]) public userPayrolls;
    PayrollInfo[] public allPayrolls;
    
    event PayrollCreated(address indexed owner, address indexed payrollContract, string companyName, uint256 timestamp);
    
    constructor(address _usdcAddress) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdcAddress = _usdcAddress;
    }
    
    /**
     * @notice Create a new payroll contract
     * @param companyName Name of the company
     * @return Address of the newly created payroll contract
     */
    function createPayroll(string memory companyName) external returns (address) {
        require(bytes(companyName).length > 0, "Company name required");
        
        PayrollV4Enhanced newPayroll = new PayrollV4Enhanced(msg.sender, usdcAddress);
        
        PayrollInfo memory info = PayrollInfo({
            payrollContract: address(newPayroll),
            owner: msg.sender,
            createdAt: block.timestamp,
            companyName: companyName
        });
        
        userPayrolls[msg.sender].push(info);
        allPayrolls.push(info);
        
        emit PayrollCreated(msg.sender, address(newPayroll), companyName, block.timestamp);
        return address(newPayroll);
    }
    
    /**
     * @notice Get all payroll contracts for a user
     * @param user User address
     */
    function getUserPayrollsInfo(address user) external view returns (PayrollInfo[] memory) {
        return userPayrolls[user];
    }
    
    /**
     * @notice Get all payroll contracts
     */
    function getAllPayrolls() external view returns (PayrollInfo[] memory) {
        return allPayrolls;
    }
    
    /**
     * @notice Get total number of payroll contracts
     */
    function getTotalPayrolls() external view returns (uint256) {
        return allPayrolls.length;
    }
}
