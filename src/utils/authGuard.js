import { useRouter } from 'vue-router';

export const authGuard = (to, from, next) => {
    const token = localStorage.getItem('token');
    if (token) {
        next();
    } else {
        next({ name: 'Login' });
    }
};

export const useAuthGuard = () => {
    const router = useRouter();
    return (to, from, next) => {
        const token = localStorage.getItem('token');
        if (token) {
            next();
        } else {
            router.push({ name: 'Login' });
        }
    };
};