declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadScript = (src: string) =>
  new Promise<boolean>((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export type CreateOrderResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
};

export async function openRazorpayCheckout(params: {
  order: CreateOrderResponse;
  name: string;
  description: string;
  image?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
}) {
  const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
  if (!ok || !window.Razorpay) {
    throw new Error('Failed to load Razorpay');
  }
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID as string;
  if (!key) {
    throw new Error('Missing VITE_RAZORPAY_KEY_ID');
  }
  return new Promise<{ razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }>((resolve, reject) => {
    const options = {
      key,
      amount: params.order.amount,
      currency: params.order.currency || 'INR',
      name: params.name,
      description: params.description,
      image: params.image,
      order_id: params.order.id,
      prefill: params.prefill,
      notes: params.notes,
      theme: { color: '#ff6b00' },
      handler: function (response: any) {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment cancelled'));
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      console.warn('Razorpay checkout failed:', response.error);
      reject(new Error(response.error?.description || 'Razorpay payment failed or connection interrupted.'));
    });
    try {
      rzp.open();
    } catch (err: any) {
      reject(new Error('Razorpay CDN connection error (ERR_NAME_NOT_RESOLVED): ' + err.message));
    }
  });
}

