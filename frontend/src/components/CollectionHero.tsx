import React from 'react';

interface HeroProps {
    title: string;
    subtitle: string;
    image: string;
}

const CollectionHero = ({ title, subtitle, image }: HeroProps) => {
    return (
        <div style={{
            //  1. NEW COLOR: Premium Slate Grey Gradient (Contrasts with Navy Header)
            background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
            borderRadius: '0 0 25px 25px',
            height: '200px', // Slightly taller to fit the model better
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '30px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>

            {/* TEXT SIDE */}
            <div style={{ color: 'white', zIndex: 10, maxWidth: '300px', marginTop: '-20px' }}>
                <h1 style={{
                    fontFamily: '"Instrument Serif", serif',
                    fontSize: '32px',
                    margin: '0',
                    fontStyle: 'italic',
                    lineHeight: '1.0',
                    letterSpacing: '-1px',
                    textShadow: '0 5px 15px rgba(0,0,0,0.3)'
                }}>
                    {title}
                </h1>
                <div style={{ width: '40px', height: '2px', background: '#ffffff', margin: '13px 0', opacity: 0.5 }}></div>
                <p style={{
                    fontSize: '8px',
                    fontWeight: '400',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    opacity: 0.8
                }}>
                    {subtitle}
                </p>
            </div>

            {/* IMAGE SIDE */}
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                zIndex: 10,
                marginRight: '20px',
                position: 'relative' // Needed for accurate positioning
            }}>
                <img
                    src={image}
                    alt={title}
                    style={{
                        height: '90%', //  2. REDUCED HEIGHT so head isn't cut off
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 0 15px rgba(0,0,0,0.4))',
                        marginBottom: '-5px' // Tucks the bottom slightly for a clean look
                    }}
                />
            </div>

            {/* DECORATIVE BG CIRCLES */}
            <div style={{ position: 'absolute', top: '-50px', right: '-25px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>
        </div>
    );
};

export default CollectionHero;