// Illustrative adventure spots for the home-page map preview. The live catalogue clusters in
// the Himalayas, so these well-known locations show what the map covers across India.
// [genre, name, lat, lng]

export type DemoGenre = "Trekking" | "Water" | "Air" | "Snow" | "Road" | "Rock";

export const DEMO_SPOTS: [DemoGenre, string, number, number][] = [
  // Trekking — Himalaya, Northeast, Western & Eastern Ghats, central highlands
  ["Trekking", "Valley of Flowers", 30.73, 79.6], ["Trekking", "Roopkund", 30.26, 79.73], ["Trekking", "Triund", 32.26, 76.36],
  ["Trekking", "Kheerganga", 31.99, 77.51], ["Trekking", "Chadar Trek", 33.6, 76.9], ["Trekking", "Markha Valley", 33.85, 77.35],
  ["Trekking", "Stok Kangri", 33.98, 77.47], ["Trekking", "Sandakphu", 27.1, 88.0], ["Trekking", "Dzukou Valley", 25.57, 94.07],
  ["Trekking", "Nongriat Root Bridges", 25.25, 91.67], ["Trekking", "Tawang Ridges", 27.6, 91.9], ["Trekking", "Kudremukh", 13.2, 75.25],
  ["Trekking", "Kumara Parvatha", 12.67, 75.69], ["Trekking", "Tadiandamol", 12.25, 75.6], ["Trekking", "Chembra Peak", 11.55, 76.08],
  ["Trekking", "Meesapulimala", 10.1, 77.1], ["Trekking", "Agasthyakoodam", 8.62, 77.25], ["Trekking", "Harishchandragad", 19.39, 73.78],
  ["Trekking", "Rajmachi", 18.83, 73.4], ["Trekking", "Kalsubai", 19.6, 73.71], ["Trekking", "Mount Abu", 24.6, 72.7],
  ["Trekking", "Pachmarhi", 22.47, 78.43], ["Trekking", "Araku Valley", 18.33, 82.87], ["Trekking", "Mahendragiri", 18.97, 84.37],
  ["Trekking", "Simlipal", 21.85, 86.35], ["Trekking", "Parasnath", 23.96, 86.13], ["Trekking", "Saputara", 20.57, 73.75],
  ["Trekking", "Girnar", 21.5, 70.53], ["Trekking", "Kodachadri", 13.86, 74.87], ["Trekking", "Mukurthi", 11.38, 76.5],
  ["Trekking", "Brahmagiri", 11.95, 75.95], ["Trekking", "Horsley Hills", 13.65, 78.4], ["Trekking", "Dhauladhar Traverse", 32.4, 76.5],
  ["Trekking", "Goecha La", 27.52, 88.2], ["Trekking", "Mechuka", 28.6, 94.12], ["Trekking", "Dhupgarh", 22.45, 78.37],

  // Water — diving, snorkelling, surfing, white water, paddling
  ["Water", "Havelock Island", 11.97, 92.99], ["Water", "Neil Island", 11.83, 93.03], ["Water", "Netrani Island", 14.02, 74.32],
  ["Water", "Agatti", 10.85, 72.18], ["Water", "Kadmat", 11.22, 72.78], ["Water", "Grande Island", 15.4, 73.78],
  ["Water", "Pondicherry Reefs", 11.93, 79.83], ["Water", "Tarkarli", 16.02, 73.47], ["Water", "Gulf of Mannar", 9.2, 79.2],
  ["Water", "Kovalam Surf", 8.4, 76.98], ["Water", "Varkala Surf", 8.73, 76.7], ["Water", "Mulki Surf", 13.09, 74.79],
  ["Water", "Gokarna", 14.55, 74.32], ["Water", "Puri Surf", 19.8, 85.83], ["Water", "Mahabalipuram Surf", 12.62, 80.19],
  ["Water", "Rishikesh Rafting", 30.1, 78.3], ["Water", "Kolad Rafting", 18.43, 73.25], ["Water", "Dandeli Rafting", 15.25, 74.62],
  ["Water", "Barapole Rafting", 12.2, 75.9], ["Water", "Indus Rafting", 34.1, 77.2], ["Water", "Teesta Rafting", 27.1, 88.45],
  ["Water", "Siang Rafting", 28.0, 95.3], ["Water", "Sundarbans Kayak", 21.95, 88.9], ["Water", "Chilika Kayak", 19.7, 85.32],
  ["Water", "Alleppey Backwaters", 9.5, 76.33], ["Water", "Loktak Lake", 24.55, 93.8], ["Water", "Dal Lake", 34.11, 74.86],
  ["Water", "Umngot River", 25.18, 92.02], ["Water", "Kali River", 15.2, 74.4], ["Water", "Zanskar Rafting", 34.0, 76.9],

  // Air — paragliding, ballooning
  ["Air", "Bir Billing", 32.04, 76.72], ["Air", "Kamshet", 18.76, 73.55], ["Air", "Vagamon", 9.68, 76.9],
  ["Air", "Gangtok Paragliding", 27.33, 88.6], ["Air", "Nandi Hills", 13.37, 77.68], ["Air", "Panchgani", 17.92, 73.8],
  ["Air", "Solang Valley", 32.32, 77.15], ["Air", "Kalimpong", 27.06, 88.47], ["Air", "Yelagiri", 12.58, 78.64],
  ["Air", "Shillong Skies", 25.57, 91.88], ["Air", "Jaipur Balloons", 26.98, 75.85], ["Air", "Pushkar Balloons", 26.49, 74.55],
  ["Air", "Lonavala Balloons", 18.75, 73.4], ["Air", "Hampi Skies", 15.35, 76.6], ["Air", "Mussoorie Glide", 30.45, 78.07],

  // Snow — skiing, snowboarding, winter camps
  ["Snow", "Gulmarg", 34.05, 74.38], ["Snow", "Auli", 30.53, 79.57], ["Snow", "Solang Ski Slopes", 32.3, 77.18],
  ["Snow", "Pahalgam", 34.01, 75.32], ["Snow", "Narkanda", 31.26, 77.45], ["Snow", "Mundali", 30.73, 77.93],
  ["Snow", "Kufri", 31.1, 77.27], ["Snow", "Sonamarg", 34.3, 75.29], ["Snow", "Dayara Bugyal", 30.85, 78.55],

  // Road — bike tours, jeep safaris, cycling
  ["Road", "Khardung La", 34.28, 77.6], ["Road", "Spiti Circuit", 32.25, 78.0], ["Road", "Rann of Kutch", 23.73, 69.86],
  ["Road", "Konkan Coast", 17.0, 73.3], ["Road", "Arunachal Frontier", 27.9, 94.6], ["Road", "Coromandel Coast", 13.5, 80.1],
  ["Road", "Kinnaur Road", 31.6, 78.4], ["Road", "Sela Pass", 27.5, 92.1], ["Road", "Chopta", 30.48, 79.2],
  ["Road", "Agumbe Ghat", 13.5, 75.1], ["Road", "Munnar Loop", 10.09, 77.06], ["Road", "Jaisalmer Dunes", 26.9, 70.9],
  ["Road", "Bikaner Desert", 28.0, 73.3], ["Road", "Ranthambore", 26.0, 76.5], ["Road", "Jim Corbett", 29.53, 78.77],
  ["Road", "Kanha", 22.33, 80.61], ["Road", "Gir", 21.12, 70.82], ["Road", "Kaziranga", 26.58, 93.17],
  ["Road", "Bandhavgarh", 23.7, 81.0], ["Road", "Nilgiri Climb", 11.4, 76.7], ["Road", "Tadoba", 20.25, 79.38],
  ["Road", "Deccan Plateau", 17.4, 77.5],

  // Rock — climbing, bouldering, caving
  ["Rock", "Hampi Bouldering", 15.33, 76.46], ["Rock", "Badami", 15.92, 75.68], ["Rock", "Turahalli", 12.88, 77.52],
  ["Rock", "Ramanagara", 12.72, 77.28], ["Rock", "Savandurga", 12.92, 77.29], ["Rock", "Dhauj", 28.35, 77.25],
  ["Rock", "Krem Liat Prah", 25.3, 92.5], ["Rock", "Borra Caves", 18.28, 83.04], ["Rock", "Belum Caves", 15.1, 78.11],
  ["Rock", "Mawsmai Cave", 25.24, 91.73], ["Rock", "Udayagiri Caves", 20.26, 85.78], ["Rock", "Edakkal Caves", 11.62, 76.23],
  ["Rock", "Duke's Nose", 18.73, 73.36], ["Rock", "Sinhagad Crags", 18.37, 73.76], ["Rock", "Kalsubai Walls", 19.62, 73.7],
];
