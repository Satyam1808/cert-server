const mongoose = require("mongoose");
const ChatbotMessage = require("./models/botModel");

mongoose
    .connect("mongodb://localhost:27017/CERT-In", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection failed:", error));

const seedMessages = async () => {
    const messages = [
        {
            message: "Hii! I am Kavix. How can I help you today?",
            options: ["Incident","Vulnerability","Advisory","Account Issue", "General Query","About CERT-In"],
            isInitial: true,
           
        },
        {
            message: "Please select a subcategory for Account Issues.",
            options: ["Forgot Password", "Update Details"],
            trigger: "Account Issue",
        },
        {
            message: "You can reset your password using the 'Forgot Password' option on the login screen.",
            options: ["Got it", "Go to Main Menu"],
            trigger: "Forgot Password",
        },

      {
        message: "You can update your details in the Account section. Navigate to the Account section to edit and manage your profile seamlessly.",
        options: ["Got it", "Go to Main Menu"],
        trigger: "Update Details",
       }, 
       {
        message: "Thank you for choosing CERT-In. Stay safe and secure.",
        options: ["Go to Main Menu"],
        trigger: "Got it",
       }, 


       {
        message: "Please select a what you want to do ?",
        options: ["Report incident","Go to Main Menu"],
        trigger: "Incident",
       }, 

       {
        message: "You can report an incident to CERT-In through various channels, including our website, email, telephone hotline, or fax.\n\n**Website**\nYou can report an incident by filling out the [incident reporting form](https://www.cert-in.org.in/) on our website. Please provide as much detail as possible to help us assess the severity and nature of the incident and assist in recovery, if needed.\n\n**Electronic Mail**\nFor incident reporting, you can email us at: [incident@cert-in.org.in](mailto:incident@cert-in.org.in).\nFor general inquiries and correspondence, write to: [info@cert-in.org.in](mailto:info@cert-in.org.in).\n*Note:* If you suspect that your system's email is compromised, consider using other means (telephone or fax) to file your report.\n\n**Telephone Hotline**\nYou can reach CERT-In via our hotline at: +91-11-22902657.\n\n**Fax**\nIncident reports can be faxed to CERT-In at: +91-11-24368546.",
        options: ["Got it", "Go to Main Menu"],
        trigger: "Report incident"
    },

    {
        message: "Please select a what you want to do ?",
        options: ["Report Vulnerability","Go to Main Menu"],
        trigger: "Vulnerability",

       }, 
    
    {
        message: "You can report a vulnerability to CERT-In by filling out the [Vulnerability Reporting Form](https://www.cert-in.org.in/) available on our website. Additionally, you can share details about a specific vulnerability via email or fax.\n\n**Email**\nSend your vulnerability details to: [vulnerability@cert-in.org.in](mailto:vulnerability@cert-in.org.in).\n\n**Fax**\nYou can fax the details to CERT-In at: +91-11-24368546.",
        options: ["Got it", "Go to Main Menu"],
        trigger: "Report Vulnerability"
    },

    {
        message: "Please select a subcategory for Advisory Issues.",
        options: ["Know about advisory", "Acceess advisory","Go to Main Menu"],
        trigger: "Advisory"
    },

    {
        message: "An advisory is the information provided by CERT-In in response to a critical vulnerability, affecting or potential to affect a large number of systems or networks in its constituency.",
        options: ["Got it","Go to Main Menu"],
        trigger: "Know about advisory"
    },{
        message: "You can access the advisory on the [CERT-In official website](https://www.cert-in.org.in/s2cMainServlet?pageid=PUBADVLIST).",
        options: ["Got it", "Go to Main Menu"],
        trigger: "Acceess advisory"
    },
    {
        message: "What is CERT-In?\nCERT-In (Indian Computer Emergency Response Team) is the national agency addressing major cybersecurity incidents for the Indian cyber community.\n\nWhat does CERT-In do?\nCERT-In raises awareness, assists in recovering from cybersecurity incidents, provides technical advice, monitors threats, and collaborates with global organizations to tackle security challenges. It also publishes advisories, guidelines, and best practices.\n\nWho runs CERT-In?\nIt operates under the Ministry of Electronics and Information Technology, Government of India.\n\nWho can report incidents to CERT-In?\nAnyone in the Indian cyber community, including users and system administrators, can report security incidents.",
        options: ["Got it", "Go to Main Menu"],
        trigger: "About CERT-In"
    },
    
    {
        message: "Please select a subcategory for General Query.",
        options: ["Contact info", "Update Details"],
        trigger: "General Query",
    },
    {
        message: "If you need to report a cybersecurity incident, you can contact the CERT-In Incident Response Help Desk:\n\nEmail: [incident@cert-in.org.in](mailto:incident@cert-in.org.in)",
        options: ["Got it", "Go to Main Menu"],
        trigger: "Contact info"
    },
    {
        message: "What action would you like to take?",
        options: ["Incident","Vulnerability","Advisory","Account Issue", "General Query","About CERT-In"],
        isInitial: false,
        trigger: "Go to Main Menu",
    },
    

];

    try {
        await ChatbotMessage.insertMany(messages);
        console.log("Messages seeded successfully");
    } catch (error) {
        console.error("Failed to seed messages:", error);
    } finally {
        mongoose.disconnect();
    }
};

seedMessages();
