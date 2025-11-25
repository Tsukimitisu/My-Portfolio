// --- 1. DARK MODE TOGGLE ---
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.classList.add('dark');
} else {
    html.classList.remove('dark');
}

themeToggle.addEventListener('click', () => {
    html.classList.toggle('dark');
    if (html.classList.contains('dark')) {
        localStorage.theme = 'dark';
    } else {
        localStorage.theme = 'light';
    }
});

// --- 2. HAMBURGER MENU (MOBILE) ---
const menuBtn = document.querySelector('[data-collapse-toggle="navbar-default"]');
const navMenu = document.getElementById('navbar-default');

if(menuBtn && navMenu) {
    menuBtn.addEventListener('click', () => {
        navMenu.classList.toggle('hidden');
    });
}

// --- 3. TYPEWRITER EFFECT ---
const typeElement = document.getElementById('typewriter');
const phrases = ["3rd Year BSIT Student ", "Programmer ", "Web Developer "];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const currentPhrase = phrases[phraseIndex];
    if (isDeleting) {
        typeElement.textContent = currentPhrase.substring(0, charIndex--);
    } else {
        typeElement.textContent = currentPhrase.substring(0, charIndex++);
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(type, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 500);
    } else {
        setTimeout(type, isDeleting ? 50 : 100);
    }
}
document.addEventListener('DOMContentLoaded', type);

// --- 4. INFINITE CAROUSEL SLIDER ---
const track = document.getElementById('track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const cards = document.querySelectorAll('.project-card');

let currentIndex = 0;

function getCardWidth() {
    const card = cards[0];
    if (!card) return 300; 
    // card width + gap (32px)
    return card.offsetWidth + 32; 
}

function updateCarousel() {
    const width = getCardWidth();
    track.style.transform = `translateX(-${currentIndex * width}px)`;
}

nextBtn.addEventListener('click', () => {
    if (currentIndex >= cards.length - 1) {
        currentIndex = 0; 
    } else {
        currentIndex++;
    }
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    if (currentIndex <= 0) {
        currentIndex = cards.length - 1; 
    } else {
        currentIndex--;
    }
    updateCarousel();
});

window.addEventListener('resize', updateCarousel);


// --- 5. CONTACT FORM (FIXED) ---
const contactForm = document.getElementById('contact-form');
const statusMsg = document.getElementById('status-msg');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = contactForm.querySelector('button');
    const originalText = btn.innerText;
    
    btn.innerText = "Sending...";
    btn.disabled = true;

    // --- CREDENTIALS ---
    const serviceID = 'service_cknbclt'; 
    const templateID = 'template_qx2j2e9'; 
    const publicKey = 'oCfXerD3vC4F4r5sj'; 

    // Prepare data (Variables must match EmailJS Template)
    const templateParams = {
        name: this.user_name.value,    
        email: this.user_email.value,  
        subject: this.subject.value,
        message: this.message.value
    };

    // FIX: Changed 'params' to 'templateParams'
    emailjs.send(serviceID, templateID, templateParams, publicKey)
        .then(() => {
            btn.innerText = "Sent Successfully!";
            btn.classList.add('bg-green-600');
            
            statusMsg.innerText = "Message sent successfully!";
            statusMsg.className = "text-center text-xs font-mono mt-4 text-green-400";
            
            contactForm.reset();
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('bg-green-600');
                btn.disabled = false;
                statusMsg.innerText = "";
            }, 3000);
        }, (err) => {
            console.error('EmailJS Error:', err);
            btn.innerText = "Failed";
            btn.classList.add('bg-red-600');
            
            statusMsg.innerText = "Error: " + JSON.stringify(err); 
            statusMsg.className = "text-center text-xs font-mono mt-4 text-red-500";
            
            btn.disabled = false;
        });
});

// --- 6. CHATBOT (COHERE) ---
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatBody = document.getElementById('chat-body');

const API_KEY = "Kosjfs1lJOQaDREHsDqbw9XyrUnf5sENUA1vN97Z"; 

const SYSTEM_PROMPT = `You are an AI assistant for James Andrei Revilla's portfolio. Be cool, professional, and concise.`;

chatToggle.addEventListener('click', () => chatWindow.classList.toggle('hidden'));
closeChat.addEventListener('click', () => chatWindow.classList.add('hidden'));

sendBtn.addEventListener('click', handleChat);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChat(); });

async function handleChat() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    userInput.value = '';

    const loadingId = addMessage("Thinking...", 'bot');
    
    try {
        const response = await fetch('https://api.cohere.ai/v1/chat', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'X-Client-Name': 'PortfolioChat'
            },
            body: JSON.stringify({
                message: text,
                preamble: SYSTEM_PROMPT,
                temperature: 0.3
            })
        });

        const data = await response.json();
        document.getElementById(loadingId).remove();

        if (data.message) {
            addMessage(`Error: ${data.message}`, 'bot');
        } else {
            addMessage(data.text, 'bot');
        }

    } catch (err) {
        document.getElementById(loadingId).remove();
        addMessage("Connection failed.", 'bot');
    }
}

function addMessage(text, sender) {
    const id = Math.random().toString(36).substr(2, 9);
    const div = document.createElement('div');
    div.id = id;
    div.className = "flex w-full " + (sender === 'user' ? "justify-end" : "justify-start");
    
    const bubble = document.createElement('div');
    bubble.className = sender === 'user' 
        ? "bg-primary text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] text-sm shadow-md"
        : "bg-white/10 text-gray-200 p-3 rounded-2xl rounded-tl-none max-w-[85%] text-sm border border-white/5";
    
    bubble.innerText = text;
    div.appendChild(bubble);
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return id;
}

// Bawal Mag Inspect Elements
document.addEventListener('contextmenu', function (e) {
    e.preventDefault(); 
});

document.onkeydown = function (e) {
   
    if (e.keyCode == 123) {
        return false;
    }
   
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) {
        return false;
    }
   
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) {
        return false;
    }
   
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'C'.charCodeAt(0)) {
        return false;
    }
 
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) {
        return false;
    }
};