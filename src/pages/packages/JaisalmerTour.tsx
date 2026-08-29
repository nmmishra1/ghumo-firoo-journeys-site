import React from 'react';
import DynamicPackageDetail from './DynamicPackageDetail';
import { commonPackageFallbacks } from './data/commonPackageFallback';

export default function JaisalmerTour() {
  return (
    <DynamicPackageDetail
      slug="jaisalmer-tour"
      fallbackData={commonPackageFallbacks['jaisalmer-tour']}
    />
  );
}