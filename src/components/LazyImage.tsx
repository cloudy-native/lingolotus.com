import { Image, ImageProps } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";

interface LazyImageProps extends ImageProps {
    src: string;
    alt: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({ src, alt, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            {
                rootMargin: "50px",
            },
        );

        observer.observe(imgRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <Image
            ref={imgRef}
            src={isInView ? src : undefined}
            alt={alt}
            onLoad={() => setIsLoaded(true)}
            opacity={isLoaded ? 1 : 0}
            transition="opacity 0.3s"
            bg="gray.100"
            {...props}
        />
    );
};
