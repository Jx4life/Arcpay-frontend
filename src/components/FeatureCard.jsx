const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-black cursor-pointer group">
    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black transition-colors duration-300">
      <div className="text-black group-hover:text-white transition-colors duration-300">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-bold text-black mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default FeatureCard;
