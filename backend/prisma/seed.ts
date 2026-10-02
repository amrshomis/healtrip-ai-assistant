import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.doctorHospital.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.specialty.deleteMany();

  // ── Specialties ──
  const specialties = await Promise.all([
    prisma.specialty.create({
      data: {
        name: 'Cardiology',
        nameAr: 'أمراض القلب',
        description: 'Heart and cardiovascular system disorders',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Orthopedics',
        nameAr: 'جراحة العظام',
        description: 'Musculoskeletal system — bones, joints, muscles',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Neurology',
        nameAr: 'أمراض الأعصاب',
        description: 'Brain, spinal cord, and nervous system disorders',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Oncology',
        nameAr: 'الأورام',
        description: 'Cancer diagnosis and treatment',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'Gastroenterology',
        nameAr: 'أمراض الجهاز الهضمي',
        description: 'Digestive system disorders',
      },
    }),
    prisma.specialty.create({
      data: {
        name: 'General Surgery',
        nameAr: 'الجراحة العامة',
        description: 'Surgical procedures across body systems',
      },
    }),
  ]);

  const [cardiology, orthopedics, neurology, oncology, gastro, surgery] = specialties;

  // ── Hospitals ──
  const hospitals = await Promise.all([
    prisma.hospital.create({
      data: {
        name: 'Istanbul Medical Center',
        nameAr: 'مركز إسطنبول الطبي',
        city: 'Istanbul',
        cityAr: 'إسطنبول',
        country: 'Turkey',
        countryAr: 'تركيا',
        address: 'Fatih Sultan Mehmet Blvd, Fatih, Istanbul',
        rating: 4.8,
        accreditation: 'JCI Accredited',
        specialties: JSON.stringify(['Cardiology', 'Orthopedics', 'Neurology', 'General Surgery']),
      },
    }),
    prisma.hospital.create({
      data: {
        name: 'Ankara University Hospital',
        nameAr: 'مستشفى جامعة أنقرة',
        city: 'Ankara',
        cityAr: 'أنقرة',
        country: 'Turkey',
        countryAr: 'تركيا',
        address: 'Sıhhiye, Ankara',
        rating: 4.6,
        accreditation: 'JCI Accredited',
        specialties: JSON.stringify(['Oncology', 'Neurology', 'Gastroenterology']),
      },
    }),
    prisma.hospital.create({
      data: {
        name: 'Dubai Healthcare City Hospital',
        nameAr: 'مستشفى مدينة دبي الطبية',
        city: 'Dubai',
        cityAr: 'دبي',
        country: 'UAE',
        countryAr: 'الإمارات',
        address: 'Dubai Healthcare City, Dubai',
        rating: 4.9,
        accreditation: 'JCI Accredited',
        specialties: JSON.stringify(['Cardiology', 'Oncology', 'Orthopedics', 'General Surgery']),
      },
    }),
    prisma.hospital.create({
      data: {
        name: 'Jordan University Hospital',
        nameAr: 'مستشفى الجامعة الأردنية',
        city: 'Amman',
        cityAr: 'عمّان',
        country: 'Jordan',
        countryAr: 'الأردن',
        address: 'Queen Rania Street, Amman',
        rating: 4.5,
        accreditation: 'HCAC Accredited',
        specialties: JSON.stringify(['Gastroenterology', 'General Surgery', 'Cardiology', 'Neurology']),
      },
    }),
  ]);

  const [istanbul, ankara, dubai, amman] = hospitals;

  // ── Doctors ──
  const doctors = await Promise.all([
    // Cardiology (2 doctors)
    prisma.doctor.create({
      data: {
        name: 'Dr. Ahmed Hassan',
        nameAr: 'د. أحمد حسن',
        specialtyId: cardiology.id,
        yearsExp: 18,
        languages: JSON.stringify(['English', 'Arabic', 'Turkish']),
        rating: 4.9,
        bio: 'Leading interventional cardiologist specializing in complex coronary procedures and heart failure management.',
        bioAr: 'طبيب قلب تداخلي رائد متخصص في إجراءات الشرايين التاجية المعقدة وإدارة قصور القلب.',
        consultationFee: 200,
        availability: JSON.stringify({ days: ['Mon', 'Wed', 'Thu'], hours: '09:00-16:00' }),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Fatima Al-Rashidi',
        nameAr: 'د. فاطمة الرشيدي',
        specialtyId: cardiology.id,
        yearsExp: 12,
        languages: JSON.stringify(['English', 'Arabic']),
        rating: 4.7,
        bio: 'Expert in non-invasive cardiac imaging, echocardiography, and preventive cardiology.',
        bioAr: 'خبيرة في التصوير القلبي غير الجراحي وتخطيط صدى القلب وطب القلب الوقائي.',
        consultationFee: 180,
        availability: JSON.stringify({ days: ['Tue', 'Wed', 'Sat'], hours: '10:00-17:00' }),
      },
    }),
    // Orthopedics (2 doctors)
    prisma.doctor.create({
      data: {
        name: 'Dr. Mehmet Yılmaz',
        nameAr: 'د. محمد يلماز',
        specialtyId: orthopedics.id,
        yearsExp: 22,
        languages: JSON.stringify(['English', 'Turkish', 'German']),
        rating: 4.8,
        bio: 'Pioneer in robotic-assisted knee and hip replacement surgery with over 3000 successful operations.',
        bioAr: 'رائد في جراحة استبدال الركبة والورك بمساعدة الروبوت مع أكثر من 3000 عملية ناجحة.',
        consultationFee: 250,
        availability: JSON.stringify({ days: ['Mon', 'Tue', 'Thu'], hours: '08:00-15:00' }),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Sara Khalid',
        nameAr: 'د. سارة خالد',
        specialtyId: orthopedics.id,
        yearsExp: 10,
        languages: JSON.stringify(['English', 'Arabic']),
        rating: 4.6,
        bio: 'Sports medicine specialist focusing on athletic injuries, ACL reconstruction, and shoulder surgery.',
        bioAr: 'أخصائية طب رياضي تركز على إصابات الرياضيين وإعادة بناء الرباط الصليبي وجراحة الكتف.',
        consultationFee: 160,
        availability: JSON.stringify({ days: ['Sun', 'Mon', 'Wed', 'Thu'], hours: '09:00-16:00' }),
      },
    }),
    // Neurology (2 doctors)
    prisma.doctor.create({
      data: {
        name: 'Dr. Omar Demir',
        nameAr: 'د. عمر دمير',
        specialtyId: neurology.id,
        yearsExp: 15,
        languages: JSON.stringify(['English', 'Turkish', 'Arabic']),
        rating: 4.7,
        bio: 'Neurologist specializing in epilepsy, stroke rehabilitation, and neurodegenerative diseases.',
        bioAr: 'طبيب أعصاب متخصص في الصرع وإعادة تأهيل السكتة الدماغية والأمراض التنكسية العصبية.',
        consultationFee: 220,
        availability: JSON.stringify({ days: ['Mon', 'Wed', 'Fri'], hours: '10:00-17:00' }),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Layla Mansour',
        nameAr: 'د. ليلى منصور',
        specialtyId: neurology.id,
        yearsExp: 8,
        languages: JSON.stringify(['English', 'Arabic', 'French']),
        rating: 4.5,
        bio: 'Specialist in headache disorders, multiple sclerosis, and clinical neurophysiology.',
        bioAr: 'متخصصة في اضطرابات الصداع والتصلب المتعدد والفيسيولوجيا العصبية السريرية.',
        consultationFee: 170,
        availability: JSON.stringify({ days: ['Tue', 'Thu', 'Sat'], hours: '09:00-15:00' }),
      },
    }),
    // Oncology (2 doctors)
    prisma.doctor.create({
      data: {
        name: 'Dr. Khalid Al-Mutairi',
        nameAr: 'د. خالد المطيري',
        specialtyId: oncology.id,
        yearsExp: 20,
        languages: JSON.stringify(['English', 'Arabic']),
        rating: 4.9,
        bio: 'Renowned medical oncologist specializing in targeted therapy and immunotherapy for solid tumors.',
        bioAr: 'طبيب أورام طبي مشهور متخصص في العلاج المستهدف والعلاج المناعي للأورام الصلبة.',
        consultationFee: 300,
        availability: JSON.stringify({ days: ['Sun', 'Tue', 'Wed'], hours: '08:00-14:00' }),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Ayşe Kaya',
        nameAr: 'د. عائشة كايا',
        specialtyId: oncology.id,
        yearsExp: 14,
        languages: JSON.stringify(['English', 'Turkish']),
        rating: 4.6,
        bio: 'Radiation oncologist with expertise in advanced IMRT and stereotactic radiosurgery.',
        bioAr: 'أخصائية أورام إشعاعية مع خبرة في العلاج الإشعاعي المتقدم والجراحة الإشعاعية التجسيمية.',
        consultationFee: 280,
        availability: JSON.stringify({ days: ['Mon', 'Thu', 'Fri'], hours: '09:00-16:00' }),
      },
    }),
    // Gastroenterology (2 doctors)
    prisma.doctor.create({
      data: {
        name: 'Dr. Noor Abbas',
        nameAr: 'د. نور عباس',
        specialtyId: gastro.id,
        yearsExp: 16,
        languages: JSON.stringify(['English', 'Arabic']),
        rating: 4.8,
        bio: 'Gastroenterologist specializing in advanced endoscopy, IBD management, and liver diseases.',
        bioAr: 'طبيب جهاز هضمي متخصص في التنظير المتقدم وإدارة أمراض الأمعاء الالتهابية وأمراض الكبد.',
        consultationFee: 190,
        availability: JSON.stringify({ days: ['Sun', 'Mon', 'Wed', 'Thu'], hours: '10:00-17:00' }),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Emre Çelik',
        nameAr: 'د. عمرو تشيليك',
        specialtyId: gastro.id,
        yearsExp: 11,
        languages: JSON.stringify(['English', 'Turkish', 'German']),
        rating: 4.5,
        bio: 'Expert in hepatology, pancreatic disorders, and therapeutic ERCP procedures.',
        bioAr: 'خبير في أمراض الكبد واضطرابات البنكرياس وإجراءات ERCP العلاجية.',
        consultationFee: 200,
        availability: JSON.stringify({ days: ['Tue', 'Wed', 'Fri'], hours: '08:00-15:00' }),
      },
    }),
    // General Surgery (2 doctors)
    prisma.doctor.create({
      data: {
        name: 'Dr. Hassan Al-Jabri',
        nameAr: 'د. حسن الجابري',
        specialtyId: surgery.id,
        yearsExp: 25,
        languages: JSON.stringify(['English', 'Arabic']),
        rating: 4.9,
        bio: 'Senior general surgeon with expertise in minimally invasive laparoscopic and robotic surgery.',
        bioAr: 'جراح عام كبير يتمتع بخبرة في الجراحة بالمنظار وجراحة الروبوت طفيفة التوغل.',
        consultationFee: 230,
        availability: JSON.stringify({ days: ['Sun', 'Mon', 'Tue', 'Thu'], hours: '07:00-14:00' }),
      },
    }),
    prisma.doctor.create({
      data: {
        name: 'Dr. Zeynep Arslan',
        nameAr: 'د. زينب أرسلان',
        specialtyId: surgery.id,
        yearsExp: 13,
        languages: JSON.stringify(['English', 'Turkish']),
        rating: 4.7,
        bio: 'Bariatric and metabolic surgeon specializing in weight loss surgery and revision procedures.',
        bioAr: 'جراحة السمنة والتمثيل الغذائي متخصصة في جراحة إنقاص الوزن وإجراءات المراجعة.',
        consultationFee: 210,
        availability: JSON.stringify({ days: ['Mon', 'Wed', 'Fri'], hours: '09:00-16:00' }),
      },
    }),
  ]);

  // ── Doctor-Hospital Assignments ──
  const assignments = [
    // Istanbul Medical Center
    { doctorIdx: 0, hospital: istanbul },  // Dr. Ahmed Hassan — Cardiology
    { doctorIdx: 2, hospital: istanbul },  // Dr. Mehmet Yılmaz — Orthopedics
    { doctorIdx: 4, hospital: istanbul },  // Dr. Omar Demir — Neurology
    { doctorIdx: 10, hospital: istanbul }, // Dr. Hassan Al-Jabri — Surgery
    // Ankara University Hospital
    { doctorIdx: 5, hospital: ankara },   // Dr. Layla Mansour — Neurology
    { doctorIdx: 6, hospital: ankara },   // Dr. Khalid Al-Mutairi — Oncology
    { doctorIdx: 9, hospital: ankara },   // Dr. Emre Çelik — Gastro
    // Dubai Healthcare City
    { doctorIdx: 1, hospital: dubai },    // Dr. Fatima Al-Rashidi — Cardiology
    { doctorIdx: 3, hospital: dubai },    // Dr. Sara Khalid — Orthopedics
    { doctorIdx: 7, hospital: dubai },    // Dr. Ayşe Kaya — Oncology
    { doctorIdx: 10, hospital: dubai },   // Dr. Hassan Al-Jabri — Surgery (dual)
    // Jordan University Hospital
    { doctorIdx: 1, hospital: amman },    // Dr. Fatima Al-Rashidi — Cardiology (dual)
    { doctorIdx: 5, hospital: amman },    // Dr. Layla Mansour — Neurology (dual)
    { doctorIdx: 8, hospital: amman },    // Dr. Noor Abbas — Gastro
    { doctorIdx: 11, hospital: amman },   // Dr. Zeynep Arslan — Surgery
  ];

  for (const { doctorIdx, hospital } of assignments) {
    await prisma.doctorHospital.create({
      data: {
        doctorId: doctors[doctorIdx].id,
        hospitalId: hospital.id,
      },
    });
  }

  console.log('✅ Seeded:');
  console.log(`   ${specialties.length} specialties`);
  console.log(`   ${doctors.length} doctors`);
  console.log(`   ${hospitals.length} hospitals`);
  console.log(`   ${assignments.length} doctor-hospital assignments`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
