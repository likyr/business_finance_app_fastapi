const API_URL = import.meta.env.VITE_API_URL || '';

const postEvent = async (payload) => {
    try {
        await fetch(`${API_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    } catch (error) {
        console.error('Ошибка отправки аналитического события:', error);
    }
};

export const trackScreenView = (eventName, params = {}) =>
    postEvent({ category: 'screen_view', event_name: eventName, ...params });

export const trackInteraction = (eventName, params = {}) =>
    postEvent({ category: 'interaction', event_name: eventName, ...params });

export const trackConversion = (eventName, params = {}) =>
    postEvent({ category: 'conversion', event_name: eventName, ...params });

export const trackSystemEvent = (eventName, params = {}) =>
    postEvent({ category: 'system', event_name: eventName, ...params });
