import os
import re

directories = ['src', 'src/components']

replacements = [
    # Location hardcodes
    (r'Delhi NCR', 'Local Region'),
    (r'Delhi Grid', 'Local Grid'),
    (r'Delhi Geo-Radial Engine', 'Geo-Radial Engine'),
    (r'South Delhi default', 'Local default'),
    (r'South Delhi Buzz', 'Local Buzz'),
    
    # Crypto/Cryptographic
    (r'(?i)cryptographic router', 'secure router'),
    (r'(?i)cryptographic protection', 'secure protection'),
    (r'(?i)cryptographically linked', 'securely linked'),
    (r'(?i)cryptographic escrow', 'secure vault'),
    (r'(?i)cryptographic', 'secure'),
    (r'(?i)100% Cryptographic Escrow', '100% Payment Guarantee'),
    
    # Escrow (contextual)
    (r'(?i)smart escrow', 'secure vault'),
    (r'Funding Escrow Wallet', 'Funding Wallet'),
    (r'Escrow Locked', 'Funds Locked'),
    (r'Total Escrow Secured', 'Total Funds Secured'),
    (r'Escrow Value', 'Campaign Value'),
    (r'Escrow Guarantee', 'Payment Guarantee'),
    (r'Escrow Release Mechanism', 'Payment Release Mechanism'),
    (r'Escrow Contract Terms Notice', 'Contract Terms Notice'),
    (r'Automated Escrow Protocol', 'Automated Payment Protocol'),
    (r'secure your escrow', 'secure your funds'),
    (r'escrow balance\.', 'wallet balance.'),
    (r'Escrow Deposit', 'Wallet Deposit'),
    (r'Deposit (.*?) to Escrow Account', r'Deposit \1 to Wallet'),
    (r'Escrow balance:', 'Wallet balance:'),
    (r'Refunded to your escrow balance', 'Refunded to your wallet balance'),
    
    # Capitalized generic replacements (risky, but we'll do specific ones)
    (r'Escrow Settings', 'Payment Settings'),
]

for directory in directories:
    for filename in os.listdir(directory):
        if filename.endswith('.tsx'):
            filepath = os.path.join(directory, filename)
            with open(filepath, 'r') as f:
                content = f.read()
            
            original_content = content
            for old, new in replacements:
                content = re.sub(old, new, content)
            
            if content != original_content:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Updated {filepath}")

print("Done cleaning text.")
