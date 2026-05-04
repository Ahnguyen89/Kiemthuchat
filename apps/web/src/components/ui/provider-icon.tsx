import React from 'react';
import { cn } from '@/lib/utils';

interface ProviderIconProps {
  provider: string;
  model?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const providerConfig = {
  OPENAI: {
    name: 'OpenAI',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 1024"
        width="20"
        height="20"
        fill="#000000"
        // style="opacity:1;"
      >
        <path
          fill-rule="evenodd"
          d="M482.878 128c-84.345 0-156.575 52.808-185.68 126.983c-60.887 8.128-115.29 43.622-146.595 97.837c-42.163 72.994-32.556 161.882 17.137 224.158c-23.38 56.748-19.853 121.597 11.424 175.782c42.18 73.024 124.095 109.152 202.937 97.235C419.585 898.621 477.51 928 540.121 928c84.346 0 156.576-52.808 185.68-126.983c60.888-8.128 115.291-43.622 146.596-97.837c42.163-72.994 32.556-161.882-17.137-224.158c23.38-56.748 19.853-121.597-11.424-175.782c-42.18-73.024-124.095-109.152-202.937-97.235C603.415 157.379 545.49 128 482.879 128m0 61.538c35.593 0 68.972 13.99 94.223 37.74c-1.928 1.031-3.925 1.845-5.832 2.946L434.594 309.13c-14.223 8.184-23.028 23.353-23.09 39.783l-.841 183.594l-65.722-38.341V327.399c0-76 61.895-137.86 137.937-137.86m197.706 75.902c44.186 3.142 86.154 27.435 109.917 68.57c17.794 30.797 22.38 66.692 14.43 100.42c-1.879-1.169-3.6-2.491-5.531-3.605l-136.734-78.907a46.23 46.23 0 0 0-46-.06l-159.463 91.106l.36-76.022l144.492-83.413c24.694-14.25 52.017-19.974 78.53-18.09M283.67 320.849c-.071 2.19-.3 4.343-.3 6.55v157.752a46.19 46.19 0 0 0 22.91 39.904l158.68 92.488l-66.021 37.68l-144.552-83.353c-65.852-38-88.47-122.526-50.448-188.341c17.783-30.78 46.556-52.689 79.731-62.68m340.393 79.927l144.552 83.354c65.852 38 88.47 122.526 50.448 188.341c-17.783 30.78-46.556 52.689-79.731 62.68c.071-2.19.3-4.343.3-6.55V570.849a46.19 46.19 0 0 0-22.91-39.904l-158.68-92.488zM511.801 464.84l54.537 31.79l-.3 63.222l-54.839 31.31l-54.537-31.85l.3-63.162zm100.536 58.654l65.722 38.341v166.767c0 76-61.895 137.86-137.937 137.86c-35.593 0-68.972-13.988-94.223-37.74c1.928-1.03 3.925-1.844 5.832-2.945l136.675-78.906c14.223-8.184 23.028-23.353 23.09-39.783zm-46.54 89.543l-.36 76.022l-144.492 83.413c-65.852 38-150.425 15.335-188.446-50.48c-17.794-30.798-22.38-66.693-14.43-100.421c1.879 1.169 3.6 2.491 5.531 3.605l136.735 78.907a46.23 46.23 0 0 0 45.999.06z"
        />
      </svg>
    ),
    color: 'bg-green-100 text-green-800 border-green-200',
    darkColor: 'dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  },
  GOOGLE: {
    name: 'Gemini',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1024 1024"
        width="20"
        height="20"
        fill="#000000"
        // style="opacity:1;"
      >
        <path d="M881 442.4H519.7v148.5h206.4c-8.9 48-35.9 88.6-76.6 115.8c-34.4 23-78.3 36.6-129.9 36.6c-99.9 0-184.4-67.5-214.6-158.2c-7.6-23-12-47.6-12-72.9s4.4-49.9 12-72.9c30.3-90.6 114.8-158.1 214.7-158.1c56.3 0 106.8 19.4 146.6 57.4l110-110.1c-66.5-62-153.2-100-256.6-100c-149.9 0-279.6 86-342.7 211.4c-26 51.8-40.8 110.4-40.8 172.4S151 632.8 177 684.6C240.1 810 369.8 896 519.7 896c103.6 0 190.4-34.4 253.8-93c72.5-66.8 114.4-165.2 114.4-282.1c0-27.2-2.4-53.3-6.9-78.5" />
      </svg>
    ),
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    darkColor: 'dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
  },
  ANTHROPIC: {
    name: 'Claude',
    icon: '🧠',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    darkColor: 'dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
  },
};

const sizeClasses = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function ProviderIcon({ 
  provider, 
  model, 
  className, 
  size = 'sm' 
}: ProviderIconProps) {
  const config = providerConfig[provider as keyof typeof providerConfig];
  
  if (!config) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 rounded border font-medium',
        sizeClasses[size],
        'bg-gray-100 text-gray-800 border-gray-200',
        'dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700',
        className
      )}>
        <span>{provider}</span>
      </span>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded border font-medium',
      sizeClasses[size],
      config.color,
      config.darkColor,
      className
    )}>
      <span>{config.icon}</span>
      <span>{config.name}</span>
      {model && (
        <span className="opacity-75 text-xs">
          {model.replace(/^[^-]+-/, '')} {/* Remove provider prefix from model name */}
        </span>
      )}
    </span>
  );
}
