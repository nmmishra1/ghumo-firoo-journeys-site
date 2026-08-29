import React from 'react';
import { validateAllTemplates } from '@/components/seo/seoTemplates';

const SeoTest: React.FC = () => {
  const { duplicates } = validateAllTemplates();
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">SEO Template Uniqueness Check</h1>
      {duplicates.length === 0 ? (
        <p className="text-green-600">All configured routes have unique titles and descriptions.</p>
      ) : (
        <div className="space-y-4">
          {duplicates.map((d, i) => (
            <div key={i} className="border p-3 rounded">
              <p className="font-semibold">Duplicate {d.field}:</p>
              <p className="text-sm text-gray-700">{d.value}</p>
              <p className="text-sm">Routes: {d.routes.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SeoTest;