
// ==========================================
import emailjs from '@emailjs/browser'
const EMAIL_CONFIG = {
    serviceId: 'service_9apl5gg',      // Masalan: service_abc123
    templateId: 'template_jyvwkqm',     // Masalan: template_xyz789
    publicKey: 'ZzHAEC6XyZqa0rRVD'        // Masalan: user_ABC123XYZ
};

export const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export const sendVerificationEmail = async (email, code, userName = '') => {
    try {
        const templateParams = {
            to_email: email,
            user_name: userName || 'Foydalanuvchi',
            verification_code: code,
            expiry_time: '10 daqiqa',
            from_name: 'Telegram App'
        }

        console.log('📧 Email yuborilmoqda:', email)
        console.log('🔐 Kod:', code)

        const response = await emailjs.send(
            EMAIL_CONFIG.serviceId,
            EMAIL_CONFIG.templateId,
            templateParams,
            EMAIL_CONFIG.publicKey
        )

        console.log('✅ Email yuborildi!', response)
        return {
            success: true,
            message: 'Email yuborildi!',
            code: code
        }

    } catch (error) {
        console.error('❌ Xatolik:', error)
        return {
            success: false,
            message: error.text || 'Email yuborishda xatolik!',
            error: error
        }
    }
}