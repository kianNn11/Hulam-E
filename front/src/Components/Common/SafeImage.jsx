import React from 'react';

function SafeImage({ src, alt, className }) {
  const [hasError, setHasError] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  // Accept any non-empty src that starts with http, /, or is a data:image/ (do not require file extension)
  const isValidImage = src && (
    src.startsWith('http') ||
    src.startsWith('/') ||
    src.startsWith('data:image/')
  );
  if (hasError || !isValidImage) {
    return (
      <div className={className + ' enhanced-checkout-item-image'} style={{background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%',position:'relative'}}>
        <img src="/default-rental-image.jpg" alt="placeholder" className="fallback-image" />
        <span style={{position:'absolute',bottom:8,left:0,right:0,textAlign:'center',fontSize:'0.85em',color:'#888'}}>Image unavailable</span>
      </div>
    );
  }
  return (
    <>
      {loading && (
        <div className="skeleton-image" style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}></div>
      )}
      <img 
        src={src} 
        alt={alt} 
        className={className + ' enhanced-checkout-item-image'} 
        onError={()=>setHasError(true)} 
        onLoad={()=>setLoading(false)} 
        style={{width:'100%',height:'100%',objectFit:'cover',display:loading?'none':'block',borderRadius:'16px'}}
      />
    </>
  );
}

export default SafeImage; 