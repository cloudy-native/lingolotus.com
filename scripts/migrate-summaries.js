const fs = require('fs');
const path = require('path');

const storiesDir = path.join(__dirname, '../data/books/stories');

// Translation map for summaries
const translations = {
    // Beginner 1
    "การทักทายและการแนะนำตัว": "Greetings and introductions",
    "สีต่างๆ ในชีวิตประจำวัน": "Colors in daily life",
    "สัตว์ต่างๆ ที่เราพบเห็น": "Animals we see",
    "สมาชิกในครอบครัว": "Family members",
    "อาหารและเครื่องดื่ม": "Food and drinks",
    "ตัวเลขและการนับ": "Numbers and counting",
    "สถานที่ต่างๆ ในเมือง": "Places in the city",
    "เวลาและกิจกรรมประจำวัน": "Time and daily activities",
    "กิจกรรมประจำวันของฉัน": "My daily activities",
    "สภาพอากาศและฤดูกาล": "Weather and seasons",
    "การพูดคุยเกี่ยวกับสัตว์ต่างๆ": "Talking about different animals",
    "การพูดคุยเกี่ยวกับสีต่างๆ": "Talking about different colors",
    "การพูดคุยเกี่ยวกับกิจกรรมประจำวัน": "Talking about daily activities",
    "การพูดคุยเกี่ยวกับสมาชิกในครอบครัว": "Talking about family members",
    "การพูดคุยเกี่ยวกับอาหารและเครื่องดื่ม": "Talking about food and drinks",
    "การพูดคุยเกี่ยวกับการทักทายและการแนะนำตัว": "Talking about greetings and introductions",
    "การพูดคุยเกี่ยวกับตัวเลขและการนับ": "Talking about numbers and counting",
    "การพูดคุยเกี่ยวกับสถานที่ต่างๆ": "Talking about different places",
    "การพูดคุยเกี่ยวกับเวลาและกิจกรรม": "Talking about time and activities",
    "การพูดคุยเกี่ยวกับสภาพอากาศ": "Talking about the weather",
    
    // Beginner 2
    "การพบปะกับเพื่อนใหม่และการสนทนาเบื้องต้น": "Meeting a new friend and basic conversation",
    "ครอบครัวใหญ่และสมาชิกในครอบครัว": "Big family and family members",
    "สีสันในชีวิตประจำวัน": "Colors in everyday life",
    "การนับและตัวเลข": "Counting and numbers",
    "เวลาและช่วงเวลาในวัน": "Time and periods of the day",
    "วันที่วุ่นวายและกิจกรรมต่างๆ": "A busy day and various activities",
    "สัตว์เลี้ยงแมวของฉัน": "My pet cat",
    "อาหารสำหรับปิกนิก": "Food for a picnic",
    "การเยี่ยมชมสถานที่ต่างๆ": "Visiting different places",
    "สภาพอากาศและฤดูกาลต่างๆ": "Weather and different seasons",
    "การพูดคุยเกี่ยวกับการไปเที่ยวสถานที่ต่างๆ": "Talking about visiting different places",
    "การพูดคุยเกี่ยวกับอากาศและฤดูกาล": "Talking about weather and seasons",
    
    // Intermediate 1
    "วันหนึ่งที่โรงเรียนและกิจกรรมต่างๆ": "A day at school and various activities",
    "การไปตลาดและการซื้อของ": "Going to the market and shopping",
    "การรับประทานอาหารที่ร้านอาหาร": "Dining at a restaurant",
    "สุขภาพและการออกกำลังกาย": "Health and exercise",
    "งานอดิเรกและกิจกรรมยามว่าง": "Hobbies and leisure activities",
    "การพบปะเพื่อนใหม่และการสนทนา": "Meeting new friends and conversation",
    "การวางแผนจัดงานปาร์ตี้": "Planning a party",
    "การช้อปปิ้งเสื้อผ้า": "Shopping for clothes",
    "การเดินทางและการท่องเที่ยว": "Traveling and tourism",
    "งานและอาชีพต่างๆ": "Work and various careers",
    "บทสนทนาเกี่ยวกับชีวิตในโรงเรียน รายวิชา ครู การบ้าน และการอ่านหนังสือกับเพื่อนที่ห้องสมุด": "Conversation about school life, subjects, teachers, homework, and reading books with friends at the library",
    "บทสนทนาเรื่องการไปตลาด ซื้อของสด ความชอบเรื่องอาหาร และการเดินทางไปตลาด": "Conversation about going to the market, buying fresh food, food preferences, and traveling to the market",
    "บทสนทนาที่ร้านอาหาร: ประเภทอาหาร เมนูที่สั่ง รสชาติ เครื่องดื่ม ของหวาน ราคา ทิป การบริการ และความถี่ในการไป": "Conversation at a restaurant: food types, menu orders, taste, drinks, desserts, prices, tips, service, and frequency of visits",
    "บทสนทนาเรื่องสุขภาพและการออกกำลังกาย: ประเภทการออกกำลังกาย วิ่ง โยคะ อาหารเพื่อสุขภาพ การดื่มน้ำ ความรู้สึกสุขภาพดี การตรวจสุขภาพ และคุณหมอ": "Conversation about health and exercise: types of exercise, running, yoga, healthy food, drinking water, feeling healthy, health checkups, and doctors",
    "บทสนทนาเกี่ยวกับงานอดิเรก การวาดรูป ฟุตบอล ทีมโปรด และการฟังเพลง": "Conversation about hobbies, drawing, football, favorite teams, and listening to music",
    "การพูดคุยเพื่อทำความรู้จักกันครั้งแรก ครอบคลุมคำถามทั่วไป งานอดิเรก และการพบเพื่อนใหม่": "Conversation for getting to know each other for the first time, covering general questions, hobbies, and meeting new friends",
    "บทสนทนาเกี่ยวกับการวางแผนจัดปาร์ตี้: วันเกิด สถานที่ อาหาร เพลง การเต้น จำนวนคน การขอความช่วยเหลือ และความตื่นเต้นของผู้ร่วมงาน": "Conversation about planning a party: birthday, venue, food, music, dancing, number of people, asking for help, and guests' excitement",
    "บทสนทนาเรื่องการช้อปปิ้งเสื้อผ้า: สถานที่ซื้อ ประเภทเสื้อผ้า สีสัน การลอง ราคา ไซซ์ ไปกับใคร ความชอบการช้อปปิ้ง และรองเท้า": "Conversation about shopping for clothes: where to buy, types of clothes, colors, trying on, prices, sizes, who to go with, shopping preferences, and shoes",
    "บทสนทนาเกี่ยวกับการท่องเที่ยว ประสบการณ์ที่ผ่านมา เมืองสำคัญ และแผนการเดินทางครั้งต่อไป": "Conversation about traveling, past experiences, major cities, and plans for the next trip",
    "บทสนทนาเกี่ยวกับงานและอาชีพ: งานปัจจุบัน หน้าที่ ความชอบ งานในฝัน เหตุผลในการสอน วิชาที่สอน ตารางงาน เวลาเริ่มงาน และเพื่อนร่วมงาน": "Conversation about work and careers: current job, duties, likes, dream job, reasons for teaching, subjects taught, work schedule, start time, and colleagues",
    
    // Intermediate 2
    "การเยี่ยมชมพิพิธภัณฑ์และศิลปะ": "Visiting a museum and art",
    "การแลกเปลี่ยนภาษาและวัฒนธรรม": "Language and cultural exchange",
    "การเริ่มต้นงานอดิเรกใหม่": "Starting a new hobby",
    "การเดินทางท่องเที่ยวช่วงสุดสัปดาห์": "A weekend getaway trip",
    "หนึ่งวันที่พิพิธภัณฑ์ศิลปะ: การค้นพบผลงานชื่อดัง บทสนทนา การมองศิลปะสมัยใหม่ วิวสวยจากคาเฟ่ และแรงบันดาลใจกลับมาอีกครั้ง": "A day at the art museum: discovering famous works, conversations, viewing modern art, beautiful cafe views, and renewed inspiration",
    "การแลกเปลี่ยนภาษาระหว่างโซเฟียและฮวน: ฝึกพูด ฟัง ดูหนัง วัฒนธรรม และมิตรภาพ": "Language exchange between Sofia and Juan: practicing speaking, listening, watching movies, culture, and friendship",
    "ทอมเริ่มงานอดิเรกปั้นดินเผา: การฝึกฝน ความท้าทาย ความภูมิใจ การแบ่งปัน และความสุขที่ไม่คาดคิด": "Tom starts pottery hobby: practice, challenges, pride, sharing, and unexpected joy",
    "เรื่องราวการพักผ่อนสุดสัปดาห์ของมาเรีย: การหนีงานที่หนัก ความสงบในชนบท น้ำตก การสำรวจ ผู้คนที่พบเจอ และแรงบันดาลใจสำหรับการเดินทางครั้งต่อไป": "Maria's weekend getaway story: escaping hard work, countryside tranquility, waterfalls, exploration, people met, and inspiration for the next trip",
    "ชมรมหนังสือของเลนา: การอภิปราย นิยายลึกลับ มุมมองต่างๆ นักเขียนรับเชิญ และคุณค่าของการอ่านร่วมกัน": "Lena's book club: discussions, mystery novels, different perspectives, guest authors, and the value of reading together",
    "วิ่งการกุศลของจามาล: การฝึกซ้อม ทีม แรงบันดาลใจ เป้าหมายการระดมทุน และสุขภาพ": "Jamal's charity run: training, team, inspiration, fundraising goals, and health",
    "สวนชุมชนของเอ็มมา: การทำงานร่วมกัน ปุ๋ยหมัก เวิร์กช็อป เด็กๆ เรียนรู้ การเก็บเกี่ยว และแรงบันดาลใจด้านความยั่งยืน": "Emma's community garden: collaboration, composting, workshops, children learning, harvesting, and sustainability inspiration",
    "ชั้นเรียนทำอาหารที่แอนนาเริ่มต้นด้วยความตื่นเต้น ฝึกทำพาสต้าสด เรียนรู้ทักษะ ความอดทน การทำงานร่วมกัน และค้นพบความรักในการทำอาหาร": "Anna's cooking class starting with excitement, practicing fresh pasta, learning skills, patience, teamwork, and discovering love for cooking",
    "การเตรียมตัวสัมภาษณ์งานของลิซ่า ความมั่นใจ กลยุทธ์ ประสบการณ์ เงื่อนไขต่างๆ และความมุ่งมั่นในอาชีพ": "Lisa's job interview preparation, confidence, strategies, experience, conditions, and career commitment",
    "โครงการถ่ายภาพของมิอา: มุมลับของเมือง พ่อค้าแม่ค้า เรื่องเล่าจากตลาด การจัดแสง และแรงบันดาลใจ": "Mia's photography project: hidden city corners, vendors, market stories, lighting, and inspiration",
    
    // Advanced 1
    "การกลับมาพบครอบครัวและความทรงจำ": "A family reunion and memories",
    "การย้ายไปเมืองใหม่และการปรับตัว": "Moving to a new city and adapting",
    "ภารกิจของอาสาสมัครและการช่วยเหลือสังคม": "A volunteer's mission and helping society",
    "การพักผ่อนในฤดูหนาวและธรรมชาติ": "A winter retreat and nature",
    "การเดินทางไปภูเขาและการผจญภัย": "Journey to the mountains and adventure",
    "ร้านขายของเก่าและสมบัติที่ซ่อนอยู่": "The antique shop and hidden treasures",
    "ศิลปะการทำขนมอบและความหลงใหล": "The art of baking and passion",
    "สมบัติที่ซ่อนอยู่ในห้องสมุด": "The library's hidden treasure",
    "เทศกาลดนตรีและความสนุกสนาน": "The music festival and entertainment",
    "ศิลปินริมถนนและความคิดสร้างสรรค์": "The street artist and creativity",
    "การรวมตัวของครอบครัวที่ฟาร์มและความสำคัญของประเพณีและความผูกพัน": "Family reunion at the farm and the importance of traditions and bonds",
    "การปรับตัวของเจมส์ในโตเกียว การเรียนรู้ภาษาและวัฒนธรรมใหม่": "James's adaptation in Tokyo, learning new language and culture",
    "การเป็นอาสาสมัครของเลียมที่ศูนย์ชุมชนและการสร้างความแตกต่าง": "Liam's volunteering at the community center and making a difference",
    "การพักผ่อนของปรียาในเทือกเขาแอลป์และการค้นพบความชัดเจนในชีวิต": "Priya's retreat in the Alps and discovering life clarity",
    "การผจญภัยบนภูเขาของเอ็มมา การเดินทางเพื่อค้นพบธรรมชาติและมิตรภาพใหม่": "Emma's mountain adventure, journey to discover nature and new friendships",
    "การค้นพบแรงบันดาลใจของเอเลนาผ่านร้านของเก่าและสิ่งของโบราณ": "Elena's discovery of inspiration through the antique shop and old objects",
    "ศิลปะการทำขนมของมาเรีย ความหลงใหลและการแบ่งปันความรักผ่านการทำขนม": "Maria's art of baking, passion and sharing love through baking",
    "การค้นพบหนังสือโบราณของคลาราและการเชื่อมโยงกับอดีต": "Clara's discovery of ancient books and connection to the past",
    "ประสบการณ์ของโซเฟียในเทศกาลดนตรีริโอ การค้นพบดนตรีและวัฒนธรรม": "Sofia's experience at Rio music festival, discovering music and culture",
    "ศิลปินริมถนนอามีร์ในปารีสและการแสดงออกผ่านภาพจิตรกรรมฝาผนัง": "Street artist Amir in Paris and expression through mural paintings",
    
    // Beginner 1 - Short summaries
    "การสนทนาเกี่ยวกับสัตว์": "Conversation about animals",
    "การสนทนาเกี่ยวกับสี": "Conversation about colors",
    "การสนทนาเกี่ยวกับกิจวัตรประจำวัน": "Conversation about daily routines",
    "การสนทนาเกี่ยวกับสมาชิกในครอบครัว": "Conversation about family members",
    "การสนทนาเกี่ยวกับอาหารที่ชอบ": "Conversation about favorite foods",
    "การสนทนาทักทายและแนะนำตัว": "Conversation about greetings and introductions",
    "การสนทนาเกี่ยวกับตัวเลขและการนับ": "Conversation about numbers and counting",
    "การสนทนาเกี่ยวกับสถานที่": "Conversation about places",
    "การสนทนาเกี่ยวกับเวลาและตารางเวลา": "Conversation about time and schedules",
    "การสนทนาเกี่ยวกับสภาพอากาศ": "Conversation about weather",
    
    // Beginner 2 - Grammar focused
    "การพูดคุยเกี่ยวกับครอบครัวและการใช้คำนามและคำคุณศัพท์": "Talking about family and using nouns and adjectives",
    "กิจวัตรประจำวันและการใช้กริยาในอดีต": "Daily routines and using past tense verbs",
    "การพูดคุยเกี่ยวกับสีและการใช้คำคุณศัพท์": "Talking about colors and using adjectives",
    "การนับเลขและการใช้ตัวเลขในประโยค": "Counting numbers and using numbers in sentences",
    "การพูดคุยเกี่ยวกับเวลาและกิจวัตรประจำวัน": "Talking about time and daily routines",
    "การพูดคุยเกี่ยวกับสัตว์เลี้ยงและการใช้กริยาในอดีต": "Talking about pets and using past tense verbs",
    "การพูดคุยเกี่ยวกับอาหารและกิจกรรมปิกนิก": "Talking about food and picnic activities"
};

function updateStoryFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const story = JSON.parse(content);
        
        // Check if summary exists and is a string
        if (story.summary && typeof story.summary === 'string') {
            const sourceText = story.summary;
            const targetText = translations[sourceText];
            
            if (targetText) {
                // Update to new format
                story.summary = {
                    source: sourceText,
                    target: targetText
                };
                
                // Write back to file
                fs.writeFileSync(filePath, JSON.stringify(story, null, 4) + '\n', 'utf8');
                console.log(`✅ Updated: ${path.basename(filePath)}`);
                return true;
            } else {
                console.log(`⚠️  No translation found for: ${path.basename(filePath)}`);
                console.log(`   Summary: "${sourceText}"`);
                return false;
            }
        } else if (story.summary && typeof story.summary === 'object') {
            console.log(`ℹ️  Already migrated: ${path.basename(filePath)}`);
            return true;
        } else {
            console.log(`ℹ️  No summary: ${path.basename(filePath)}`);
            return true;
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function migrateAllStories() {
    const files = fs.readdirSync(storiesDir)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(storiesDir, file));
    
    console.log(`\n🔄 Migrating ${files.length} story files...\n`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    files.forEach(file => {
        const result = updateStoryFile(file);
        if (result === true) updated++;
        else if (result === false) skipped++;
        else errors++;
    });
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`\n✨ Migration complete!\n`);
}

// Run migration
migrateAllStories();
