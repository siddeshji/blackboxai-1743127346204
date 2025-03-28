document.addEventListener('DOMContentLoaded', function() {
    // Tab switching
    const tabs = document.querySelectorAll('.payment-tab');
    const forms = document.querySelectorAll('.payment-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            forms.forEach(form => form.classList.add('hidden'));
            document.getElementById(`${tab.dataset.tab}-form`).classList.remove('hidden');
        });
    });

    // Get crypto rates
    fetch('/api/payments/crypto/rates')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('btc-rate').textContent = `1 BTC = $${data.rates.BTC.toLocaleString()}`;
                document.getElementById('eth-rate').textContent = `1 ETH = $${data.rates.ETH.toLocaleString()}`;
                document.getElementById('usdt-rate').textContent = `1 USDT = $${data.rates.USDT.toFixed(2)}`;
            }
        });

    // Crypto selection
    const cryptoOptions = document.querySelectorAll('.crypto-option');
    let selectedCrypto = null;
    
    cryptoOptions.forEach(option => {
        option.addEventListener('click', () => {
            cryptoOptions.forEach(opt => opt.classList.remove('border-indigo-500', 'bg-indigo-50'));
            option.classList.add('border-indigo-500', 'bg-indigo-50');
            selectedCrypto = option.dataset.crypto;
            
            const amount = parseFloat(document.getElementById('crypto-amount').value);
            if (amount > 0) {
                updateCryptoAmount(amount, selectedCrypto);
                document.getElementById('crypto-pay-button').disabled = false;
            }
        });
    });

    // Crypto amount calculation
    document.getElementById('crypto-amount').addEventListener('input', function() {
        const amount = parseFloat(this.value);
        if (amount > 0 && selectedCrypto) {
            updateCryptoAmount(amount, selectedCrypto);
            document.getElementById('crypto-pay-button').disabled = false;
        } else {
            document.getElementById('crypto-pay-button').disabled = true;
        }
    });

    function updateCryptoAmount(usdAmount, crypto) {
        fetch('/api/payments/crypto/rates')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const rate = data.rates[crypto];
                    const cryptoAmount = usdAmount / rate;
                    
                    document.getElementById('crypto-amount-display').textContent = 
                        `${cryptoAmount.toFixed(8)} ${crypto}`;
                    
                    document.getElementById('crypto-details').classList.remove('hidden');
                }
            });
    }

    // Process crypto payment
    document.getElementById('crypto-pay-button').addEventListener('click', function() {
        const amount = parseFloat(document.getElementById('crypto-amount').value);
        
        fetch('/api/payments/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentMethod: 'crypto',
                amount: amount,
                currency: 'USD',
                cryptoNetwork: selectedCrypto === 'ETH' ? 'ERC20' : 
                              selectedCrypto === 'BTC' ? 'BTC' : 'TRC20'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('crypto-wallet').value = data.data.walletAddress;
                document.getElementById('crypto-network').textContent = 
                    selectedCrypto === 'ETH' ? 'Ethereum (ERC20)' : 
                    selectedCrypto === 'BTC' ? 'Bitcoin' : 'Tron (TRC20)';
                
                this.textContent = 'Payment Address Generated';
                this.disabled = true;
            } else {
                alert('Error: ' + data.message);
            }
        });
    });

    // Copy wallet address
    document.getElementById('copy-wallet').addEventListener('click', function() {
        const walletInput = document.getElementById('crypto-wallet');
        walletInput.select();
        document.execCommand('copy');
        
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
    });

    // Process card payment
    document.getElementById('pay-button').addEventListener('click', function() {
        const cardNumber = document.getElementById('card-number').value;
        const expiry = document.getElementById('expiry').value;
        const cvc = document.getElementById('cvc').value;
        const amount = parseFloat(document.getElementById('amount').value);
        
        if (!cardNumber || !expiry || !cvc || !amount) {
            alert('Please fill all card details');
            return;
        }

        this.disabled = true;
        this.textContent = 'Processing...';
        
        fetch('/api/payments/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentMethod: 'card',
                amount: amount,
                currency: 'USD'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Payment successful! Transaction ID: ${data.data.id}`);
            } else {
                alert('Payment failed: ' + data.message);
            }
        })
        .finally(() => {
            this.disabled = false;
            this.textContent = 'Pay Now';
        });
    });
});