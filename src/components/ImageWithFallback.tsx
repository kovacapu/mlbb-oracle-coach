import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    className,
    fallbackText,
    ...props
}) => {
    const [status, setStatus] = useState<'loading' | 'error' | 'loaded'>('loading');

    return (
        <div className={`relative overflow-hidden w-full h-full bg-gray-900 ${className}`}>
            {status === 'loading' && (
                <div className="absolute inset-0 bg-mlbb-darker animate-pulse flex items-center justify-center">
                    {/* Skeleton Loading Effect: Shiny gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-mlbb-gold/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
            )}

            {status === 'error' && (
                <div className="absolute inset-0 bg-gray-900 border border-mlbb-neonBlue/30 flex flex-col items-center justify-center text-mlbb-neonBlue/50 text-shadow-sm">
                    <HelpCircle className="w-1/2 h-1/2 mb-1" />
                    {fallbackText && <span className="text-[10px] font-bold tracking-wider">{fallbackText}</span>}
                </div>
            )}

            <img
                src={src}
                alt={alt}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
                className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                {...props}
            />
        </div>
    );
};
