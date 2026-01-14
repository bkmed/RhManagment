#!/bin/bash

# Format all files in specified directories using Prettier
echo "Running Prettier on src, scripts, cypress, and e2e..."

npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,scss,md}" \
                     "scripts/**/*.{sh,py,js,json}" \
                     "cypress/**/*.{ts,tsx,js,jsx,json}" \
                     "e2e/**/*.{ts,tsx,js,jsx,json}"

echo "Formatting complete!"
