'use client';

import { useEffect, useRef, useState } from 'react';

interface LazyVideoProps {
    src: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function LazyVideo({ src, className, style }: LazyVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setShouldLoad(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' } // Load slightly before it comes into view
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <video
            ref={videoRef}
            className={className}
            style={style}
            autoPlay={shouldLoad}
            loop
            muted
            playsInline
        >
            {shouldLoad && <source src={src} type="video/mp4" />}
            Your browser does not support the video tag.
        </video>
    );
}
