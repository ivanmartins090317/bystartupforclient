interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({title, description}: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900">{title}</h1>
      {description && <p className="text-gray-600 mt-2">{description}</p>}
    </div>
  );
}
