export const destinationRegions = [
    {
        id: "xian",
        name: { en: "Xi'an", cn: "西安" },
        days: [1, 2, 3, 4],
        coordinates: [34.3416, 108.9398],
        heroImage: "https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=2070&auto=format&fit=crop",
        description: {
            en: "Ancient capital of China, home to the legendary Terracotta Warriors and 3,000 years of history",
            cn: "中国古都，拥有传奇的兵马俑和3000年历史"
        },
        color: "#D84315",
        highlights: { en: ["Terracotta Warriors", "City Wall", "Muslim Quarter"], cn: ["兵马俑", "古城墙", "回民街"] }
    },
    {
        id: "beijing",
        name: { en: "Beijing", cn: "北京" },
        days: [5, 6],
        coordinates: [39.9042, 116.4074],
        heroImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=2070&auto=format&fit=crop",
        description: {
            en: "China's capital city, featuring the iconic Great Wall and imperial Forbidden City",
            cn: "中国首都，拥有标志性的长城和皇家故宫"
        },
        color: "#1976D2",
        highlights: { en: ["Great Wall", "Forbidden City", "Fragrant Hills"], cn: ["长城", "故宫", "香山"] }
    },
    {
        id: "lushan",
        name: { en: "Lushan Region", cn: "庐山地区" },
        days: [7, 8, 9, 10],
        coordinates: [29.5628, 115.9928],
        heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
        description: {
            en: "Mystical mountain landscapes, traditional villages, and the beautiful countryside of Wuyuan",
            cn: "神秘的山景、传统村落和婺源美丽的乡村"
        },
        color: "#388E3C",
        highlights: { en: ["Lushan Summit", "Jingdezhen Ceramics", "Wuyuan Villages"], cn: ["庐山顶峰", "景德镇陶瓷", "婺源村落"] }
    },
    {
        id: "shangrao",
        name: { en: "Shangrao", cn: "上饶" },
        days: [11],
        coordinates: [28.4549, 117.9432],
        heroImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop",
        description: {
            en: "Gateway to Mount Sanqing, featuring stunning natural scenery and ancient Taoist heritage",
            cn: "三清山门户，拥有壮丽的自然风光和古老的道教文化"
        },
        color: "#FF7043",
        highlights: { en: ["Mount Sanqing", "Natural Scenery"], cn: ["三清山", "自然风光"] }
    },
    {
        id: "taishan",
        name: { en: "Mount Tai Region", cn: "泰山地区" },
        days: [12, 13, 14],
        coordinates: [36.2565, 117.1009],
        heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
        description: {
            en: "The sacred Mount Tai, foremost of China's Five Great Mountains, and birthplace of Confucius",
            cn: "神圣的泰山，五岳之首，孔子故里"
        },
        color: "#7B1FA2",
        highlights: { en: ["Mount Tai Summit", "Dai Temple", "Confucius Temple"], cn: ["泰山顶峰", "岱庙", "孔庙"] }
    },
    {
        id: "qingdao",
        name: { en: "Qingdao", cn: "青岛" },
        days: [15],
        coordinates: [36.0671, 120.3826],
        heroImage: "https://images.unsplash.com/photo-1589800950114-e0d80663c2d1?q=80&w=2070&auto=format&fit=crop",
        description: {
            en: "Beautiful coastal city, departure point for your journey home",
            cn: "美丽的海滨城市，返程起点"
        },
        color: "#00796B",
        highlights: { en: ["Coastal Views", "Departure"], cn: ["海景", "返程"] }
    }
];

export const routeCoordinates = [
    [34.3416, 108.9398],  // Xi'an
    [39.9042, 116.4074],  // Beijing
    [29.5628, 115.9928],  // Lushan
    [29.2481, 117.8614],  // Wuyuan
    [36.1955, 117.1209],  // Tai'an
    [36.0671, 120.3826],  // Qingdao
];

// Trip statistics
export const tripStats = {
    days: 15,
    destinations: 5,
    hikingKm: 100,
    elevation: 4500
};
