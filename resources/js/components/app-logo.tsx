import { useState } from 'react';
import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="flex w-full items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="flex aspect-square size-8 items-center justify-center rounded-md text-sidebar-primary-foreground">
                <AppLogoIcon
                    className="size-5 fill-current text-white dark:text-black"
                    animate={isHovered}
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Obviousgadget
                </span>
            </div>
        </div>
    );
}
