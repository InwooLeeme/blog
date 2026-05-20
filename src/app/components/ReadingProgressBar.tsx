"use client"

import { useState, useEffect, useCallback } from 'react';
import { cn } from "@/lib/utils";

/* 페이지 읽기 진행률을 표시하는 컴포넌트 */
const ReadingProgressBar = () => {
    const [scrollProgress, setScrollProgress] = useState(0);

    const calculateScrollProgress = useCallback(() => {
        /* 
        - document.documentElement.scrollHeight: 문서 전체 내용의 높이
        - document.documentElement.clientHeight: 브라우저 창의 높이
        - totalHeight: 사용자가 스크롤 할 수 있는 실제 거리 (가장 위 ~ 가장 아래)
        */
        const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        /* 현재 스크롤 위치 */
        const scrolled = window.scrollY;
        if(totalHeight > 0){
            const progress = (scrolled / totalHeight) * 100;
            setScrollProgress(progress);
        }
        else{
            setScrollProgress(0);
        }
    }, []);

    useEffect(() => {
        calculateScrollProgress();

        window.addEventListener('scroll', calculateScrollProgress);
        return () => {
            window.removeEventListener('scroll', calculateScrollProgress);
        }
    }, [calculateScrollProgress]);

    return (
        <div className={cn('fixed top-0 left-0 h-1 z-20 w-full','bg-transparent')}>
            <div
              className="h-full bg-accent-brand transition-transform duration-100 ease-out shadow-lg shadow-accent-brand/50"
              style={{
                width: `${scrollProgress}%`,
                transform: 'translateX(0%)'
              }}
            />
        </div>
    )
}

export default ReadingProgressBar;