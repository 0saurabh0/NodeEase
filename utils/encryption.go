package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
)

var encryptionKey []byte

func init() {
	key := os.Getenv("ENCRYPTION_KEY")
	if key == "" {
		panic("ENCRYPTION_KEY environment variable is not set")
	}

	// Decode the base64 key
	decodedKey, err := base64.StdEncoding.DecodeString(key)
	if err != nil {
		panic(fmt.Sprintf("Invalid ENCRYPTION_KEY format: %v", err))
	}

	// Check if the key is the correct length for AES-256
	if len(decodedKey) != 32 {
		panic("ENCRYPTION_KEY must be a base64-encoded 32-byte value")
	}

	encryptionKey = decodedKey
}

// Encrypt encrypts a string using AES-GCM
func Encrypt(plaintext string) (string, error) {
	if len(plaintext) == 0 {
		return "", errors.New("plaintext cannot be empty")
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %v", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %v", err)
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", fmt.Errorf("failed to generate nonce: %v", err)
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts a string using AES-GCM
func Decrypt(encrypted string) (string, error) {
	if len(encrypted) == 0 {
		return "", errors.New("encrypted text cannot be empty")
	}

	ciphertext, err := base64.StdEncoding.DecodeString(encrypted)
	if err != nil {
		return "", fmt.Errorf("failed to decode base64: %v", err)
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", fmt.Errorf("failed to create cipher: %v", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", fmt.Errorf("failed to create GCM: %v", err)
	}

	if len(ciphertext) < gcm.NonceSize() {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := ciphertext[:gcm.NonceSize()], ciphertext[gcm.NonceSize():]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt: %v", err)
	}

	return string(plaintext), nil
}
