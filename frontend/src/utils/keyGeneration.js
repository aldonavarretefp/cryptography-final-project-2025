export async function exportPublicKey(publicKey) {
    const exported = await window.crypto.subtle.exportKey(
        "spki", // Export format for public key
        publicKey
    );
    return bufferToBase64(exported);
}

export async function exportPrivateKey(privateKey) {
    const exported = await window.crypto.subtle.exportKey(
        "pkcs8", // Export format for private key
        privateKey
    );
    return bufferToBase64(exported);
}

export function bufferToBase64(buffer) {
    const binary = String.fromCharCode.apply(null, new Uint8Array(buffer));
    return btoa(binary);
}

function base64ToBuffer(base64) {
    const binaryString = atob(base64); // Decode the base64 string
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; // Return as an ArrayBuffer
}

async function importPublicKey(base64PublicKey) {
    const publicKeyBuffer = base64ToBuffer(base64PublicKey); // Properly decode the base64 string
    return window.crypto.subtle.importKey(
        "spki",
        publicKeyBuffer,
        {
            name: "RSA-OAEP", // or "RSA-PSS" depending on your use case
            hash: { name: "SHA-256" }
        },
        true,
        ["verify"]
    );
}


export async function importPrivateKey(base64PrivateKey) {
    const binaryDerString = atob(base64PrivateKey);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer.buffer,
        {
            name: "RSA-PSS",
            hash: { name: "SHA-256" }
        },
        true, // Extractable
        ["sign"] // Key usage
    );
}

