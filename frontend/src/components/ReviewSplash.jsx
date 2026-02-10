
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ReviewSplash({ onComplete }) {
    const [text, setText] = useState('');
    const fullText = "VeriNews Security Check...";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, index + 1));
            index++;
            if (index > fullText.length) {
                clearInterval(interval);
                setTimeout(onComplete, 800);
            }
        }, 50); // Typing speed

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 flex items-center justify-center z-[100]">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-sans text-2xl font-light tracking-wide text-gray-800 dark:text-gray-200"
            >
                {text}
                <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="ml-1 inline-block w-2 h-6 bg-purple-500 align-middle"
                />
            </motion.div>
        </div>
    );
}
