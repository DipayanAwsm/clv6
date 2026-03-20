import React, { useState } from 'react';

const initialState = {
  age: 42,
  annual_income: 75000,
  tenure_months: 36,
  recency: 45,
  frequency: 10,
  monetary: 1850,
  average_order_value: 185,
  claim_rate: 0.05,
  complaint_rate: 0.02,
  renewal_ratio: 0.7,
  premium_amount: 1400,
  channel: 'online',
  region: 'north',
  product_type: 'premium'
};

const PredictionForm = ({ onPredict, loading }) => {
  const [form, setForm] = useState(initialState);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const numericFields = [
      'age',
      'annual_income',
      'tenure_months',
      'recency',
      'frequency',
      'monetary',
      'average_order_value',
      'claim_rate',
      'complaint_rate',
      'renewal_ratio',
      'premium_amount'
    ];

    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onPredict(form);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {Object.entries(form).map(([key, value]) => (
        <label key={key}>
          <span>{key}</span>
          <input
            name={key}
            value={value}
            onChange={handleChange}
            type={typeof value === 'number' ? 'number' : 'text'}
            step={typeof value === 'number' ? 'any' : undefined}
          />
        </label>
      ))}
      <button type="submit" disabled={loading}>
        {loading ? 'Predicting...' : 'Predict Customer Value'}
      </button>
    </form>
  );
};

export default PredictionForm;
