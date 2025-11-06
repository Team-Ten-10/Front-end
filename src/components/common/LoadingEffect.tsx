const LoadingEffect = () => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex gap-2">
      <div className="w-3 h-3 bg-green-600 rounded-full loading-dot"></div>
      <div className="w-3 h-3 bg-green-600 rounded-full loading-dot"></div>
      <div className="w-3 h-3 bg-green-600 rounded-full loading-dot"></div>
    </div>
  );
};

export default LoadingEffect;
