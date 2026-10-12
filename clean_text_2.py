import os
import re

directories = ['src', 'src/components']

replacements = [
    (r'(?i)Hyperlocal Escrow', 'Creator Marketplace'),
    (r'(?i)Hyperlocal Grid', 'Creator Network'),
    (r'(?i)Hyperlocal Match Engine', 'Match Engine'),
    (r'(?i)hyperlocal escrow network', 'creator network'),
    (r'(?i)hyperlocal campaign', 'local campaign'),
    (r'(?i)hyperlocal offers', 'local offers'),
    (r'(?i)hyperlocal', 'local'),
    (r'(?i)geo-targeted', 'location-based'),
    (r'(?i)Geo-Radial Engine', 'Location Engine'),
    
    (r'(?i)Escrow Protocol State', 'Payment State'),
    (r'(?i)Unclaimed Escrow Balance', 'Unclaimed Balance'),
    (r'(?i)Escrow Release', 'Payment Release'),
    (r'(?i)Budget escrowed', 'Budget secured'),
    (r'(?i)locked escrow funds', 'locked funds'),
    (r'(?i)escrow moves', 'payment activity'),
    (r'(?i)escrow balance', 'wallet balance'),
    (r'(?i)Escrow Status', 'Payment Status'),
    (r'(?i)Active Campaigns & Escrows', 'Active Campaigns & Payments'),
    (r'(?i)Total Escrow', 'Total Budget'),
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

print("Done cleaning text 2.")
