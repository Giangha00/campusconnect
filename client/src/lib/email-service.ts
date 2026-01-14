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

    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email API error:', response.status, errorText);
      let errorMessage = 'Lỗi khi gửi email';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      return {
        success: false,
        message: errorMessage
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Lỗi kết nối khi gửi email'
    };
  }
}

// Generate ticket number
export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TCK-${timestamp}-${random}`.toUpperCase();
}
