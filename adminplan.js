const express = require('express');
const app = express();
const port = 4000;

// 1. Redirect /admin to /admin/signin
app.get('/admin', (req, res) => {
    res.redirect(302, '/admin/signin');
});

// 2. Serve signin page
app.get('/admin/signin', (req, res) => {
    res.sendFile(__dirname + '/public/admin/signin.html');
});

// 3. Handle signin form submission
app.post('/admin/signin', (req, res) => {
    // Validate credentials (pseudo-code)
    if (validCredentials(req.body)) {
        // 4. Show splash/loading page with auto-redirect
        const splashPage = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Loading Admin Dashboard</title>
                <style>.splash { /* your splash styles */ }</style>
            </head>
            <body>
                <div class="splash">
                    <div class="loader">Loading dashboard...</div>
                </div>
                <script>
                    setTimeout(() => {
                        window.location.href = "/admin/dashboard";
                    }, 3000);
                </script>
            </body>
            </html>
        `;
        res.send(splashPage);
    } else {
        res.redirect('/admin/signin?error=1');
    }
});

// 5. Serve dashboard after splash
app.get('/admin/dashboard', authenticateMiddleware, (req, res) => {
    res.sendFile(__dirname + '/public/admin/dashboard.html');
});

// Authentication middleware
function authenticateMiddleware(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.redirect('/admin/signin');
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});