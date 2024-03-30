// metamask.js

document.addEventListener('DOMContentLoaded', async () => {
    // Detect MetaMask provider
    const provider = await detectEthereumProvider();

    if (provider) {
        // Enable MetaMask
        window.ethereum.enable();

        // Initialize web3
        const web3 = new Web3(window.ethereum);

        // Check if the user is connected
        const accounts = await web3.eth.getAccounts();

        const handleLogin = async () => {
            try {
                // Request MetaMask to connect
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                // Check if the user is connected
                const accounts = await web3.eth.getAccounts();
                if (accounts.length > 0) {
                    console.log('MetaMask connected:', accounts[0]);
                    // You can use accounts[0] for further authentication or other actions
                } else {
                    console.log('MetaMask not connected');
                    // Handle the case where the user is not connected
                }
            } catch (error) {
                console.error('MetaMask login error:', error.message);
                // Handle errors, e.g., user rejected the connection
            }
        };

        // Attach click event listener to MetaMask login button
        const loginButton = document.getElementById('metamask-login');
        if (loginButton) {
            loginButton.addEventListener('click', handleLogin);
        }

        // Optionally, you can also check the account on page load
        if (accounts.length > 0) {
            console.log('MetaMask connected:', accounts[0]);
            // You can use accounts[0] for further authentication or other actions
        } else {
            console.log('MetaMask not connected');
            // Handle the case where the user is not connected
        }
    } else {
        console.log('MetaMask not found');
        // Handle the case where MetaMask is not installed
    }
});
