// Publish a number only after the support owner confirms it is monitored.
// International format: country code + number, digits only (no leading +).
export const supportWhatsAppNumber = '2349160328576';
export function whatsappSupportUrl(number:string,text='') {
 const digits=number.replace(/[\s+()-]/g,'');
 if(!/^[1-9]\d{7,14}$/.test(digits))return null;
 return `https://wa.me/${digits}${text?`?text=${encodeURIComponent(text)}`:''}`;
}
