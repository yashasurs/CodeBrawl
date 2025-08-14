interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function PageHeader({ title, subtitle, description }: PageHeaderProps) {
  return (
    <div className="py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-white to-purple-400 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-purple-200 mb-4 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
