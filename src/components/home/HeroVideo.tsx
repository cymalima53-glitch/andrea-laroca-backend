'use client';

import { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

export default function HeroVideo({ src, poster }: { src: string, poster?: string }) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        console.log("🎬 HeroVideo: Attempting to load", src);

        // Force mute to allow autoplay
        video.defaultMuted = true;
        video.muted = true;

        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name === 'AbortError') return;
                console.warn("🎬 HeroVideo: Auto-play prevented:", error);
            });
        }
    }, [src]);

    return (
        <video
            ref={videoRef}
            className={styles.heroVideo}
            src={src}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            onLoadedData={() => console.log("🎬 HeroVideo: Data loaded")}
            onError={(e) => {
                const err = e.currentTarget.error;
                console.error("🎬 HeroVideo: Error details:", {
                    code: err?.code,
                    message: err?.message
                });
            }}
        />
    );
}
