import type { CSSProperties, SVGAttributes } from 'react';

type AppLogoIconProps = SVGAttributes<SVGElement> & {
    animate?: boolean;
};

export default function AppLogoIcon(props: AppLogoIconProps) {
    const { style, className, animate = false, ...rest } = props;
    const mergedStyle = {
        cursor: 'pointer',
        ...(style as CSSProperties),
    };
    const combinedClassName = ['app-logo-icon', className].filter(Boolean).join(' ');

    return (
        <svg
            {...rest}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 54 53"
            width="200"
            height="200"
            style={mergedStyle}
            className={combinedClassName}
            data-animated={animate || undefined}
        >
            <style>
                {`
                    .cube {
                        transform-box: fill-box;
                        transform-origin: center;
                        transition: transform 0.9s cubic-bezier(0.19, 1, 0.22, 1);
                    }

                    .app-logo-icon:hover .secondColumnTop,
                    .app-logo-icon[data-animated="true"] .secondColumnTop {
                        transform: translateY(11px) translateX(-11px) rotate(320deg);
                    }

                    .app-logo-icon:hover .thirdColumnMiddle,
                    .app-logo-icon[data-animated="true"] .thirdColumnMiddle {
                        transform: translateY(7px) translateX(-7px) rotate(310deg);
                    }

                    .app-logo-icon:hover .thirdColumnTop,
                    .app-logo-icon[data-animated="true"] .thirdColumnTop {
                        transform: translateY(16px) translateX(-17px) rotate(270deg);
                    }



                `}
            </style>

            <path
                className="cube top firstColumnTop"
                d="M0 16H11V27H0V16Z"
                fill="black"
            />
            <path
                className="cube middle firstColumnMiddle"
                d="M0 29H11V40H0V29Z"
                fill="black"
            />
            <path
                className="cube bottom firstColumnBottom"
                d="M0 42H11V53H0V42Z"
                fill="black"
            />

            {/* Column 1 */}

            {/* Column 2 */}

            <path
                className="cube middle secondColumnTop"
                d="M29.0708 3L37.4973 10.0707L30.4266 18.4972L22.0001 11.4265L29.0708 3Z"
                fill="black"
                style={animate ? { transform: 'translateY(11px) translateX(-11px) rotate(320deg)' } : undefined}
            />

            <path
                className="cube top secondColumnMiddle"
                d="M13 29H24V40H13V29Z"
                fill="black"
            />
            <path
                className="cube middle secondColumnBottom"
                d="M13 42H24V53H13V42Z"
                fill="black"
            />

            {/* Column 3 */}

            <path
                className="cube top thirdColumnTop"
                d="M43 0H54V11H43V0Z"
                fill="black"
                style={animate ? { transform: 'translateY(16px) translateX(-17px) rotate(270deg)' } : undefined}
            />

            <path
                className="cube bottom thirdColumnMiddle"
                d="M39.4263 20L46.4969 28.4265L38.0704 35.4972L30.9998 27.0707L39.4263 20Z"
                fill="black"
                style={animate ? { transform: 'translateY(7px) translateX(-7px) rotate(310deg)' } : undefined}
            />

            <path
                className="cube bottom thirdColumnBottom"
                d="M26 42H37V53H26V42Z"
                fill="black"
            />
        </svg>
    );
}
