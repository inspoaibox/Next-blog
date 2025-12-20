import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { SliderItem } from '../stores/site-settings.store';

interface SliderProps {
  items: SliderItem[];
  style: 'full' | 'cards' | 'minimal';
}

export function Slider({ items, style }: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1 || style !== 'full') return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [items.length, style]);

  if (items.length === 0) return null;

  // 全宽轮播
  if (style === 'full') {
    return (
      <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-xl mb-8">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              {item.link ? (
                <Link href={item.link} className="block">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.title}</h2>
                  {item.description && <p className="text-white/80 text-sm md:text-base">{item.description}</p>}
                </Link>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{item.title}</h2>
                  {item.description && <p className="text-white/80 text-sm md:text-base">{item.description}</p>}
                </>
              )}
            </div>
          </div>
        ))}
        {items.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors text-2xl font-bold"
              aria-label="上一张"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors text-2xl font-bold"
              aria-label="下一张"
            >
              ›
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`切换到第 ${index + 1} 张`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // 卡片网格
  if (style === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {items.slice(0, 3).map((item) => (
          <div key={item.id} className="relative h-48 rounded-xl overflow-hidden group">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              {item.link ? (
                <Link href={item.link} className="block">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  {item.description && <p className="text-white/80 text-sm truncate">{item.description}</p>}
                </Link>
              ) : (
                <>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  {item.description && <p className="text-white/80 text-sm truncate">{item.description}</p>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 简约横幅
  if (style === 'minimal') {
    const item = items[0];
    return (
      <div className="relative h-32 md:h-40 rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-primary-600 to-primary-400">
        {item.image && (
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-30" />
        )}
        <div className="relative h-full flex items-center justify-center text-center text-white p-4">
          {item.link ? (
            <Link href={item.link}>
              <h2 className="text-xl md:text-2xl font-bold">{item.title}</h2>
              {item.description && <p className="text-white/80 mt-1">{item.description}</p>}
            </Link>
          ) : (
            <>
              <h2 className="text-xl md:text-2xl font-bold">{item.title}</h2>
              {item.description && <p className="text-white/80 mt-1">{item.description}</p>}
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
