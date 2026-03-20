export const businessHighlights = [
  'Predict CLV to move budget from intuition-based allocation to measurable value-based investment.',
  'Identify high-value customers early and route them into retention, upsell, or automation tracks.',
  'Convert model outputs into operational actions that sales, service, and marketing can execute immediately.'
];

export const executiveNarrativeSteps = [
  {
    step: '1. Base Data',
    detail: 'Profile customer data quality, coverage, and target readiness before modeling.'
  },
  {
    step: '2. EDA',
    detail: 'Expose value concentration and risk signals to frame business strategy.'
  },
  {
    step: '3. Feature Engineering',
    detail: 'Use RFM and behavioral signals to represent customer value dynamics.'
  },
  {
    step: '4. Feature Selection',
    detail: 'Validate predictive signals using multiple methods and consensus voting.'
  },
  {
    step: '5. Model Benchmarking',
    detail: 'Compare multiple algorithms with objective metrics and pick winners.'
  },
  {
    step: '6. Operationalization',
    detail: 'Expose predictions via API and dashboard with action recommendations.'
  }
];

export const featureEngineeringNarrative = [
  'RFM captures behavioral intensity: recent activity, repeat interactions, and monetary contribution.',
  'Complaint and claim ratios quantify service burden that can suppress realized CLV.',
  'Renewal ratio and engagement score capture retention momentum and future value probability.',
  'Derived features outperform many raw columns because they encode business behavior directly.'
];

export const businessActions = [
  {
    segment: 'High CLV + high churn risk',
    action: 'Launch urgent save campaign with executive outreach, service recovery, and tailored offer.',
    owner: 'Retention + Service'
  },
  {
    segment: 'High CLV + low churn risk',
    action: 'Push loyalty, premium servicing, and strategic upsell/cross-sell programs.',
    owner: 'Sales + Account Management'
  },
  {
    segment: 'Medium CLV + active',
    action: 'Nurture through personalized journeys to move segment upward.',
    owner: 'Growth Marketing'
  },
  {
    segment: 'Low CLV',
    action: 'Run cost-efficient automated engagement and monitor for migration signals.',
    owner: 'Lifecycle Automation'
  }
];

export const budgetAllocationGuide = [
  { bucket: 'Retention defense', recommended_share: '40%', note: 'Protect high-value at-risk accounts first.' },
  { bucket: 'Upsell growth', recommended_share: '30%', note: 'Expand wallet share in stable high-value segments.' },
  { bucket: 'Nurture conversion', recommended_share: '20%', note: 'Move medium-value customers into premium cohorts.' },
  { bucket: 'Automation baseline', recommended_share: '10%', note: 'Maintain low-cost coverage for low-value segment.' }
];

export const managerDemoScript = [
  'Start with model-readiness, dataset type, and high-value threshold to establish governance.',
  'Show model comparison winners and explain why objective metrics selected them.',
  'Run single-customer prediction and highlight action priority + budget treatment.',
  'Upload a CSV and show portfolio-level summary to demonstrate operational scalability.'
];
