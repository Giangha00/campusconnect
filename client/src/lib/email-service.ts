interface SendEmailRequest {
  to: string;
  name: string;
  eventName: string;
  ticket: string;
}

interface SendEmailResponse {
  success: boolean;
  message: string;
}

export async function sendRegistrationEmail(data: SendEmailRequest): Promise<SendEmailResponse> {
  try {
    const response = await fetch('/api/send-registration-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: 'Lỗi kết nối khi gửi email'
    };
  }
}

// Generate ticket number
export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TCK-${timestamp}-${random}`.toUpperCase();
}
