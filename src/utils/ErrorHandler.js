export class ErrorHandler {
    constructor(snackbar, router) {
        this.snackbar = snackbar;
        this.router = router;
    }

    handle(error) {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    this.snackbar.message = "Unauthorized! Redirecting to login...";
                    this.snackbar.show = true;
                    setTimeout(() => {
                        this.router.push({ name: 'Login' });
                    }, 2000);
                    break;
                case 404:
                    this.snackbar.message = "Resource not found!";
                    this.snackbar.show = true;
                    break;
                case 500:
                    this.snackbar.message = "Internal server error!";
                    this.snackbar.show = true;
                    break;
                case 422:
                    this.snackbar.message = "Validation error!";
                    this.snackbar.show = true;
                    break;
                default:
                    this.snackbar.message = "An unexpected error occurred!";
                    this.snackbar.show = true;
            }
        } else if (error.request) {
            this.snackbar.message = "No response from server!";
            this.snackbar.show = true;
        } else {
            this.snackbar.message = `Error: ${error.message}`;
            this.snackbar.show = true;
        }
    }
}
