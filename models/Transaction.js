const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true,
        default: 'USD'
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['card', 'crypto']
    },
    cryptoNetwork: {
        type: String,
        required: function() {
            return this.paymentMethod === 'crypto';
        }
    },
    walletAddress: {
        type: String,
        required: function() {
            return this.paymentMethod === 'crypto';
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);