import React, { useState } from "react";

const ShareButton = ({ getShareUrl }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    const handleClick = async () => {
        const url = await getShareUrl();
        if (!url) return;

        setShareUrl(url); // Save the shareable URL
        setShowOptions((prev) => !prev);
        navigator.clipboard.writeText(url); // Optional: copy right away
    };

    const shareTo = {
        whatsapp: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
        facebook: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        gmail: (url) =>
            `https://mail.google.com/mail/?view=cm&fs=1&to=&su=Check this post&body=${encodeURIComponent(url)}&tf=1`,
    };

    return (
        <div className="share-container">
            <button onClick={handleClick}>🔗 Share</button>
            {showOptions && (
                <div className="share-options">
                    <a href={shareTo.whatsapp(shareUrl)} target="_blank" rel="noopener noreferrer">📱 WhatsApp</a>
                    <a href={shareTo.facebook(shareUrl)} target="_blank" rel="noopener noreferrer">📘 Facebook</a>
                    <a href={shareTo.gmail(shareUrl)} target="_blank" rel="noopener noreferrer">📧 Gmail</a>
                    <button onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        alert("Link copied to clipboard!");
                    }}>
                        📋 Copy Link
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareButton;
