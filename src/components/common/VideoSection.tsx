'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../../app/[lang]/coffee/coffee.module.css';

interface VideoSectionProps {
    videoSrc: string;
    caption?: string;
    poster?: string;
}

export default function VideoSection({ videoSrc, caption, poster }: VideoSectionProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Load video if not loaded yet
                        if (!videoLoaded && videoRef.current && !videoRef.current.src) {
                            videoRef.current.src = videoSrc;
                            setVideoLoaded(true);
                        }

                        // Autoplay when visible
                        if (videoRef.current) {
                            videoRef.current.play().catch(e => console.log("Autoplay prevented by browser", e));
                        }
                    } else {
                        // Pause when out of view (optional)
                        if (videoRef.current) {
                            videoRef.current.pause();
                        }
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of video is visible
                rootMargin: '50px' // Start loading 50px before
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [videoSrc, videoLoaded]);

    return (
        <section className={styles.videoSection} ref={containerRef}>
            {caption && <div className={styles.videoCaption}>{caption}</div>}
            <div className={styles.videoContainer}>
                <video
                    ref={videoRef}
                    className={styles.videoPlayer}
                    controls
                    width="100%"
                    height="auto"
                    preload="metadata"
                    poster={poster}
                    muted={false} // User requested sound, but beware browsers block unmuted autoplay often. Keeping false per request.
                >
                    {/* Source is set via JS for lazy load, but we can keep a fallback or empty source initially */}
                    <source type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </section>
    );
}
