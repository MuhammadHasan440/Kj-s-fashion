// js/contact.js - Premium Version with Toast Notifications
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) {
        console.error('Contact form not found!');
        return;
    }
    
    console.log('✨ Contact form initialized with premium features');
    
    // Create toast container
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create message container for form feedback
    let messageContainer = document.querySelector('.form-message');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.className = 'form-message';
        contactForm.insertBefore(messageContainer, contactForm.firstChild);
    }
    
    // Add all CSS styles
    const style = document.createElement('style');
    style.textContent = `
        /* ===== TOAST CONTAINER ===== */
        .toast-container {
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        /* ===== TOAST NOTIFICATION ===== */
        .toast-notification {
            min-width: 320px;
            max-width: 420px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.05);
            display: flex;
            align-items: center;
            padding: 14px 18px;
            gap: 14px;
            animation: toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            transform-origin: right;
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        @keyframes toastSlideIn {
            0% {
                opacity: 0;
                transform: translateX(100%) scale(0.8);
            }
            100% {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
        }
        
        @keyframes toastSlideOut {
            0% {
                opacity: 1;
                transform: translateX(0) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateX(100%) scale(0.8);
            }
        }
        
        .toast-notification.hide {
            animation: toastSlideOut 0.3s ease-out forwards;
        }
        
        /* Toast Icon */
        .toast-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            flex-shrink: 0;
            animation: iconPop 0.4s ease-out;
        }
        
        @keyframes iconPop {
            0% {
                transform: scale(0);
            }
            80% {
                transform: scale(1.2);
            }
            100% {
                transform: scale(1);
            }
        }
        
        .toast-success .toast-icon {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
        }
        
        .toast-error .toast-icon {
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
        }
        
        .toast-info .toast-icon {
            background: linear-gradient(135deg, #d1ecf1, #bee5eb);
            color: #0c5460;
        }
        
        /* Toast Content */
        .toast-content {
            flex: 1;
        }
        
        .toast-title {
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 4px;
            font-family: 'Montserrat', sans-serif;
            letter-spacing: -0.2px;
        }
        
        .toast-message {
            font-size: 13px;
            color: #666;
            font-family: 'Montserrat', sans-serif;
            line-height: 1.4;
        }
        
        /* Toast Close Button */
        .toast-close {
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
            padding: 0;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.2s;
            flex-shrink: 0;
        }
        
        .toast-close:hover {
            background: rgba(0,0,0,0.05);
            color: #333;
            transform: scale(1.1);
        }
        
        /* Toast Progress Bar */
        .toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #d4af7a, #0a0e27);
            animation: progress 3s linear forwards;
        }
        
        @keyframes progress {
            from {
                width: 100%;
            }
            to {
                width: 0%;
            }
        }
        
        /* Toast Colors by Type */
        .toast-success {
            border-left: 4px solid #28a745;
            background: white;
        }
        
        .toast-error {
            border-left: 4px solid #dc3545;
            background: white;
        }
        
        .toast-info {
            border-left: 4px solid #17a2b8;
            background: white;
        }
        
        /* ===== FORM MESSAGE STYLES ===== */
        .form-message {
            margin-bottom: 24px;
        }
        
        .alert {
            padding: 14px 18px;
            border-radius: 12px;
            margin-bottom: 16px;
            animation: slideDown 0.4s ease-out;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            line-height: 1.5;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .alert-success {
            background: linear-gradient(135deg, #d4edda, #c3e6cb);
            color: #155724;
            border: none;
        }
        
        .alert-error {
            background: linear-gradient(135deg, #f8d7da, #f5c6cb);
            color: #721c24;
            border: none;
        }
        
        .alert-loading {
            background: linear-gradient(135deg, #d1ecf1, #bee5eb);
            color: #0c5460;
            border: none;
        }
        
        .alert::before {
            font-size: 20px;
            font-weight: bold;
        }
        
        .alert-success::before {
            content: "✓";
        }
        
        .alert-error::before {
            content: "✕";
        }
        
        .alert-loading::before {
            content: "⏳";
            animation: spin 1s linear infinite;
            display: inline-block;
        }
        
        /* ===== BUTTON STYLES ===== */
        button.loading {
            opacity: 0.7;
            cursor: not-allowed;
            position: relative;
            overflow: hidden;
        }
        
        button.loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
            100% {
                left: 100%;
            }
        }
        
        .spinner {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 0.6s linear infinite;
            margin-right: 10px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* ===== FORM ERROR STYLES ===== */
        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
            border-color: #dc3545 !important;
            animation: shake 0.3s ease;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        /* ===== SUCCESS CONFETTI (Optional) ===== */
        .confetti {
            position: fixed;
            width: 10px;
            height: 10px;
            background: #d4af7a;
            position: absolute;
            animation: confettiFall 3s linear forwards;
        }
        
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .toast-container {
                top: 70px;
                right: 10px;
                left: 10px;
            }
            .toast-notification {
                min-width: auto;
                max-width: none;
                width: auto;
            }
            .alert {
                padding: 12px 14px;
                font-size: 13px;
            }
        }
    `;
    document.head.appendChild(style);
    
    // ===== TOAST FUNCTION =====
    function showToast(type, title, message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.closest('.toast-notification').remove()">×</button>
            <div class="toast-progress" style="animation-duration: ${duration/1000}s"></div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('hide');
                setTimeout(() => {
                    if (toast.parentNode) toast.remove();
                }, 300);
            }
        }, duration);
        
        return toast;
    }
    
    // ===== SIMPLE CONFETTI EFFECT =====
    function showConfetti() {
        const colors = ['#d4af7a', '#0a0e27', '#28a745', '#d4edda'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 8 + 4 + 'px';
            confetti.style.height = confetti.style.width;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    // ===== SHOW FORM MESSAGE =====
    function showMessage(type, text) {
        messageContainer.innerHTML = '';
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type}`;
        messageDiv.innerHTML = text;
        messageContainer.appendChild(messageDiv);
        
        if (type !== 'loading') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.opacity = '0';
                    messageDiv.style.transform = 'translateY(-10px)';
                    messageDiv.style.transition = 'all 0.3s ease';
                    setTimeout(() => {
                        if (messageDiv.parentNode) {
                            messageDiv.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }
        
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // ===== SET LOADING STATE =====
    function setLoading(isLoading) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (!submitButton) return;
        
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.classList.add('loading');
            const originalText = submitButton.textContent;
            submitButton.setAttribute('data-original-text', originalText);
            submitButton.innerHTML = '<span class="spinner"></span> Sending Message...';
        } else {
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
            const originalText = submitButton.getAttribute('data-original-text');
            if (originalText) {
                submitButton.textContent = originalText;
            }
        }
    }
    
    // ===== API URL DETECTION =====
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const API_URL = isLocal ? 'http://localhost:3001/api/contact' : '/api/contact';
    
    console.log(`%c✨ Environment: ${isLocal ? 'Local Development' : 'Production'}`, 'color: #d4af7a; font-size: 12px');
    console.log(`%c📡 API URL: ${API_URL}`, 'color: #0a0e27; font-size: 12px');
    
    // ===== FORM SUBMISSION =====
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const firstName = document.getElementById('firstName')?.value.trim() || '';
        const lastName = document.getElementById('lastName')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const subject = document.getElementById('subject')?.value || '';
        const message = document.getElementById('message')?.value.trim() || '';
        
        // Client-side validation
        const errors = [];
        
        const removeErrorClass = (id) => {
            const element = document.getElementById(id);
            if (element) element.classList.remove('error');
        };
        
        if (!firstName) {
            errors.push('First name is required');
            document.getElementById('firstName')?.classList.add('error');
        } else { removeErrorClass('firstName'); }
        
        if (!lastName) {
            errors.push('Last name is required');
            document.getElementById('lastName')?.classList.add('error');
        } else { removeErrorClass('lastName'); }
        
        if (!email) {
            errors.push('Email address is required');
            document.getElementById('email')?.classList.add('error');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address');
            document.getElementById('email')?.classList.add('error');
        } else { removeErrorClass('email'); }
        
        if (!subject) {
            errors.push('Please select a subject');
            document.getElementById('subject')?.classList.add('error');
        } else { removeErrorClass('subject'); }
        
        if (!message) {
            errors.push('Message is required');
            document.getElementById('message')?.classList.add('error');
        } else { removeErrorClass('message'); }
        
        if (errors.length > 0) {
            showToast('error', 'Validation Error', errors[0]);
            showMessage('error', errors.join('<br>'));
            return;
        }
        
        // Show loading state
        setLoading(true);
        showMessage('loading', '⏳ Sending your message...');
        
        const startTime = Date.now();
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    subject: subject,
                    message: message
                }),
            });
            
            const result = await response.json();
            const elapsedTime = Date.now() - startTime;
            const minDisplayTime = 800; // Minimum 800ms loading for better UX
            const waitTime = Math.max(0, minDisplayTime - elapsedTime);
            
            if (response.ok && result.success) {
                // Success with delay for better UX
                setTimeout(() => {
                    setLoading(false);
                    contactForm.reset();
                    showToast('success', '✨ Email Sent!', 'Your message has been delivered successfully', 3500);
                    showMessage('success', '✓ Thank you! Your message has been sent successfully.');
                    showConfetti(); // Optional: Add confetti effect
                }, waitTime);
                
            } else {
                setTimeout(() => {
                    setLoading(false);
                    showToast('error', '❌ Failed!', result.error || 'Something went wrong', 4000);
                    showMessage('error', result.error || 'Failed to send message');
                }, waitTime);
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            const elapsedTime = Date.now() - startTime;
            const waitTime = Math.max(0, 800 - elapsedTime);
            
            setTimeout(() => {
                setLoading(false);
                
                let errorTitle = 'Network Error';
                let errorMessage = 'Cannot connect to server.';
                
                if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    errorMessage = 'Backend server not running. Please start with: node server.js';
                } else if (error.message.includes('Invalid server response')) {
                    errorMessage = 'Server returned invalid response. Check backend configuration.';
                } else {
                    errorMessage = error.message;
                }
                
                showToast('error', errorTitle, errorMessage, 5000);
                showMessage('error', errorMessage);
            }, waitTime);
        }
    });
    
    // ===== REAL-TIME ERROR CLEARING =====
    const formInputs = ['firstName', 'lastName', 'email', 'subject', 'message'];
    formInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function() {
                this.classList.remove('error');
            });
            element.addEventListener('focus', function() {
                this.classList.remove('error');
            });
        }
    });
    
    // ===== API CONNECTION TEST (Local Only) =====
    if (isLocal) {
        setTimeout(async () => {
            try {
                const testResponse = await fetch('http://localhost:3001/api/test');
                if (testResponse.ok) {
                    console.log('%c✅ API server is connected!', 'color: #28a745; font-size: 12px');
                    showToast('success', 'Connected!', 'Backend server is running', 2000);
                } else {
                    console.warn('%c⚠️ API server responded with error', 'color: #ffc107; font-size: 12px');
                }
            } catch (error) {
                console.warn('%c⚠️ API server not reachable. Run: node server.js', 'color: #dc3545; font-size: 12px');
                setTimeout(() => {
                    showToast('info', 'ℹ️ Server Status', 'Backend not running. Start with: node server.js', 5000);
                }, 2000);
            }
        }, 1500);
    }
});