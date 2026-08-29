
export interface PayUData {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  service_provider: string;
}

export function initiatePayUPayment(data: PayUData) {
  const PAYU_URL = import.meta.env.VITE_PAYU_ENV === 'production' 
    ? 'https://secure.payu.in/_payment' 
    : 'https://test.payu.in/_payment';

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = PAYU_URL;

  Object.entries(data).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}
