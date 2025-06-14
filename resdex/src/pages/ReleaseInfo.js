import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';


const releaseNotes = {
  v100: {
    title: 'V1.00 | Initial',
    date: 'October 13th, 2024',
    author: 'Dev Patel',
    description:`
    
**V1.00** established the foundational architecture of the ResDex platform, focusing on essential page routing, layout components, and early visual identity. This release set the groundwork for core navigation, branding, and user orientation.

Development began with key scaffolding for navigation and landing experiences. The **Home**, **About**, **Features**, **Contact**, and **Team** pages were created with structured routing via React components such as home.js, navbar.js, and infosection.js.

A major focus was placed on establishing a **clean, responsive layout** that performs well across devices and offers users a clear understanding of ResDex's purpose. The about.js file introduced mission-aligned text and headings, while contact.js, footer.js, and team.js helped organize essential informational and legal content into distinct sections.

#### Key Features Introduced:

-   **Landing Page Design**: Created a fully functional homepage that reflects ResDex's value proposition.

-   **Navigation System**: Implemented a consistent Navbar with routing across major pages like About, News, Sign In, and more.

-   **About Section**: Added headings and text to explain the mission, features, and audience of the platform.

-   **Responsive Footer**: Developed a responsive footer component featuring copyright information and key links (Terms, GitHub, Contact).

-   **Visual Consistency**: Unified fonts, colors, and layout padding for a clean, cohesive UI across all sections.

-   **Flexbox Layouts**: Used modern CSS practices to ensure mobile compatibility and screen adaptability.

**V1.00** was focused on shaping the user-facing identity of ResDex and delivering a structured, easy-to-navigate interface. These early architectural and design choices formed the core experience upon which all future features would be layered.


      `,
    tags: ['General Development', 'UI Foundation', 'Initial Launch'],
  },
  v101: {
    title: 'V1.01 | Signup Verification',
    date: 'October 16th, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.01** enhanced user authentication features and profile management, laying the foundation for secure access and personalized experiences.

This update introduced a **signup verification page** and implemented **Firebase Sign-in**, connecting the sign-in button to the Firebase Auth flow. A **conditional UI** was created to hide the sign-in option when users are already logged in, improving user navigation.

A new **Profile.js layout** was created to display user details, hooking into **Firebase auth.currentUser** to fetch the **display name** and **email** dynamically.

Key account management functionalities were also added, including a **logout function** utilizing Firebase's **SignOut()** method, and a **password reset** feature on the **recovery.js** page. Users can now enter their email to receive a **Firebase password reset link**, complete with a validation message to guide the process.

Additional improvements include:

-   **Signup verification** to enhance account security.

-   Seamless **Firebase Auth integration** to streamline user login and logout.

-   User profile display connected directly to authentication data for real-time updates.

-   Password recovery workflow to improve user account management and reduce friction.

**V1.01** solidifies the platform's authentication system and basic profile features, creating a more secure and user-friendly environment.`,
    tags: ['Authentication', 'Firebase Integration'],
  },
  v102: {
    title: 'V1.02 | Cloud Storage',
    date: 'October 18th, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.02** expanded the platform's data storage and file handling functionality while optimizing resource usage to enhance user experience and system efficiency.

This update implemented **Firebase Cloud Storage** integration, enabling **authenticated users** to securely **upload and retrieve avatar images**. The profile now dynamically displays the user's profile picture through components like **firebase.js** and **Profile.js**.

A key addition was the **PDF upload feature** using **Amazon S3**, with a dedicated upload component configured via the **AWS S3 SDK**. This function allows users to **select and securely upload PDF resumes**, with a placeholder system prepared for future retrieval capabilities.

To further optimize performance, **local storage** was enabled to cache the **display name** and **photo URL**, minimizing the number of costly **Firebase reads**. Both the profile and home pages now utilize **localStorage** to load cached user data, improving load times and user responsiveness.

Additionally, a **Firestore read limit fix** was introduced to reduce read operations and speed up repeated page loads, critical for staying within Firebase's free tier limits and reducing operational costs.

Key improvements include:

-   Integration with **Firebase Cloud Storage** for image uploads.

-   Initial support for **PDF resume uploads** via **Amazon S3** with secure file handling.

-   Use of **local storage caching** to minimize database reads and improve load speed.

-   Optimization of Firestore read operations to reduce costs and enhance performance.

**V1.02** represents a crucial step in enhancing both the front-end user profile features and backend storage solutions, setting a foundation for future file management and performance improvements.`,
    tags: ['Cloud Storage', 'PDF Upload', 'Performance Optimization'],
  },
  v110: {
    title: 'V1.10 | Notifications & Profile Updates',
    date: 'October 23rd, 2024',
    author: 'Tirth Patel',
    description:`
      
**V1.10** represents a **major update** focused on expanding user profiles, enabling public access to profiles, and enhancing PDF resume handling with improved security and scalability.

The release introduced the ability to **view other users' profiles** by creating a **routing system** based on **user ID or username**. User data including **display name, email, bio, and profile image** is fetched dynamically from **Firestore**. Profile links are now integrated throughout card lists and search results, improving navigation and discovery.

The **navbar was fixed and improved** to update correctly on **OAuth state changes** and remain consistent after page refreshes. This prevents blank loading states and further limits unnecessary Firestore reads. Public profile URLs follow the structure:\
https://.../profile/{userid}.

Additionally, a scalable structure was set up to support **friend connections, resume previews, and profile editing** with smooth transitions between signed-in and signed-out user states. Improvements were made to **local storage caching** and **Firestore collection handling** to optimize performance.

On **Oct 22**, an **editable "About You" section** was added to profiles, allowing users to write a short personal description directly within **Profile.js**.

Significant upgrades were made to the **PDF upload and viewing functionality**:

-   **PDF resumes are now sourced and fetched from AWS S3** using **pre-signed URLs**, improving file security and access control.

-   Enhanced **error handling** was added for missing or expired documents.

-   For the first time, **non-authorized users** can view public resumes through shared links.

-   Security was strengthened with **download protection** and **timeout features** to prevent unauthorized access.

Key highlights include:

-   Public **profile viewing** with dynamic Firestore data fetching.

-   Robust **username-based routing** enabling easy profile access.

-   **Navbar consistency** improvements tied to OAuth state management.

-   Editable user **About You** section integrated into profiles.

-   Advanced **PDF resume fetching** via AWS S3 with secure pre-signed URLs.

-   **Public resume access** with download protection and expiration timeouts.

**V1.10** significantly enhances social connectivity and document management on the platform, laying the groundwork for richer user interactions and improved privacy controls.
`,
    tags: ['User Profiles', 'PDF Management', 'Security Enhancements'],
  },
  v111: {
    title: 'V1.11 | Document Removal',
    date: 'October 24th, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.11** focused on enhancing document management by adding functionality to **remove documents** from **AWS S3** storage securely and efficiently.

This update implemented an **AWS S3 key removal method** that parses document keys to accurately identify and delete files from the storage bucket. Users can now delete uploaded documents, improving control over their stored data.

The user interface was updated to **reflect document removals in real-time**, disabling any broken links immediately to prevent access to deleted files and maintain a smooth user experience.

Key highlights include:

-   Introduction of **document deletion functionality** through AWS S3 key parsing.

-   Real-time **UI updates** to reflect removed documents and disable broken links.

-   Improved **user control** over uploaded content and cleaner file management.

**V1.11** strengthens the platform's file management capabilities by enabling users to securely manage and remove their stored documents with immediate visual feedback.
`,
    tags: ['Document Management', 'UI Updates'],
  },
  v112: {
    title: 'V1.12 | Authentication & Upload Fixes',
    date: 'October 29th, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.12** focused on improving **authentication reliability**, enforcing stricter **username validation**, and implementing protective measures on file uploads to safeguard platform resources.

Key bug fixes included resolving issues where users could **sign up and instantly log in without verification**, as well as adding a **logout confirmation** step to prevent accidental logouts.

The username field now enforces a **regex pattern** that disallows special characters, ensuring cleaner and more consistent usernames, which improves **URL link clarity** and reduces errors during signup.

In file handling, the **PDF upload process to the AWS S3 bucket was refined** with new limits set to prevent abuse: a **maximum of 10 uploads per day** and a **5MB size cap per file**. These constraints help mitigate **malicious activity** and keep storage usage within manageable bounds, with plans to explore compression strategies for larger files in the future.

Key highlights include:

-   Fixed sign-up/login flow bugs, including **instant login without verification**.

-   Added **logout confirmation** to avoid accidental session termination.

-   Enforced stricter **username regex** preventing special characters.

-   Implemented **upload rate limiting** (10 uploads/day) and **file size limit** (5MB) for PDFs.

-   Improved PDF S3 handling for better security and resource management.

**V1.12** enhances both user experience and backend resilience by tightening authentication workflows and protecting storage infrastructure.
`,
    tags: ['Authentication Fix', 'Upload Tweaks'],
  },
  v120: {
    title: 'V1.20 | Search Functionality',
    date: 'October 31st, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.20** brought significant improvements to the platform's **search capabilities** and **user interface**, enhancing discoverability and content organization.

A new **user search function** was implemented using **Firebase queries**, currently limited to **10 results** to reduce excessive Firestore reads and maintain performance. Note that indexing for projects is still pending and will be developed in future updates.

The **Navbar underwent a design change**, switching text labels back to **icons** for a cleaner look, with the possibility of reverting based on user feedback.

PDF document management was enhanced by adding **search by PDF title**, enabling users to find documents more efficiently. A **flexbox layout** was created to display multiple PDF documents in a single row, reducing excessive scrolling and improving visual organization.

Key highlights include:

-   Added **user search** via Firebase with a **limit of 10 listings** to optimize read costs.

-   Introduced **PDF search by title** with plans to add **tag-based filtering** later.

-   Redesigned Navbar to use **icons instead of text labels** for streamlined navigation.

-   Implemented a **flexbox layout** to display multiple PDFs horizontally, limiting vertical scroll.

**V1.20** marks a step forward in content discovery and UI refinement, setting a foundation for future search enhancements and better user engagement.
`,
    tags: ['Search Function', 'UI Function'],
  },
  v121: {
    title: 'V1.21 | UI Cleanup & Modals',
    date: 'November 2nd, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.21** emphasized **front-end polish**, **user guidance**, and **improved editing workflows**, delivering a cleaner experience and enhancing the platform's support and documentation structure.

On **November 1**, the **Success page** was added to provide visual confirmation following actions like ticket or document submission---improving feedback loops and user trust. A **dedicated Contact page** was created for streamlined support, wired directly into the platform's backend. Additionally, a **Release Docs page** was introduced, showcasing upcoming features, deployment status, and repository usage.

The **Team section** was visually refreshed with an updated image and added placeholders for new role slots. The **README.md** file also saw improvements, including clearer **installation steps**, **feature usage guides**, and **contribution workflows** for future developers.

On **November 2**, the profile editing interface saw a major UI improvement:

-   Replaced the static in-page edit layout in **Profile.js** with a **modal popup**.

-   This paves the way for **editable tags**, dynamic fields, and future extensibility.

**Highlights:**

-   **Success Page Redirect**: Provides immediate confirmation after user actions.

-   **Contact Page**: Built-in form linked to backend routing for inquiries or support.

-   **Release Docs Page**: Centralized area for version notes, repo guidance, and roadmap visibility.

-   **Profile Modal Editor**: Cleaner interface for profile updates with room for extensible field types.

-   **README Update**: Better developer onboarding through clarified setup and contribution details.

**V1.21** delivered essential workflow enhancements while refining platform presentation, preparing ResDex for smoother scaling and future modularity.
`,
    tags: ['UI Cleanup', 'Modals'],
  },
  v121: {
    title: 'V1.30 | Profile Tags & Edit Controls',
    date: 'November 4th, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.30** delivered a major update focused on refining the **profile** and **dashboard user interface**, improving usability, and optimizing backend interactions. The redesigned layout improved readability, spacing, and flow, creating a cleaner and more intuitive user experience. A new editable **Tag section** was introduced, allowing users to add, delete, and display custom profile attributes stored dynamically in Firestore.

Significant **Firebase optimizations** were implemented to reduce unnecessary writes by checking if fields were changed before updating, helping control operational costs. Users gained the ability to **edit uploaded PDFs**, modifying metadata such as title, tags, and topics post-upload, supported by patched Firestore update logic that now detects changes properly before committing.

The update resolved **UI dropdown visibility conflicts** on macOS and Windows by integrating a unified Select component style. To prevent accidental document deletion, a **confirmation pop-up** was added when removing uploaded files.

Additional minor UI improvements included fixing the footer's **"Back to Top"** button and adjusting spacing on the contact page. The framework for document upload displays was reworked, replacing the previous flat layout and adding cache verification to avoid redundant data fetching.

Key improvements included:

-   Redesigned profile/dashboard UI for better readability and flow

-   **Editable** tag fields dynamically managed in Firestore

-   Optimized **Firestore** writes by change detection

-   Editable metadata for uploaded PDFs with reliable update logic

-   Unified dropdown styling for **cross-platform** consistency

-   **Confirmation dialog** to prevent accidental document deletions

-   Footer and contact page UI refinements

-   Reworked upload display framework with cache double-check

**V1.30** strengthened the platform's **user interface** and backend efficiency, enhancing **user control** and preparing the foundation for more dynamic profile features moving forward.
`,
    tags: ['Tags System', 'PDF Editing'],
  },
  v131: {
    title: 'V1.31 | Document Tagging & Search Enhancement',
    date: 'November 5th, 2024',
    author: 'Tirth Patel',
    description:
      `**V1.31** focused on enriching document management and search capabilities to provide users with better organization and faster access to relevant content.

This update introduced **document tagging during uploads**, allowing users to assign descriptive tags that improve search accuracy and categorization across the platform. A new **search by topic** parameter was implemented, enabling users to filter documents based on assigned tags or topics for more precise results.

To enhance performance, the frontend caching mechanism was updated by **increasing cache refresh intervals to 5 minutes**, reducing unnecessary data fetches when users revisit pages frequently.

Additionally, a critical **tag initialization fix** resolved an issue where tags were appearing as blank or empty on first load, ensuring consistent tag display and improved user experience.

Key features introduced include:

-   Document tagging available during **upload** to aid categorization

-   **Search filtering** by assigned topic for refined document discovery

-   Frontend cache refresh interval increased to **5 minutes** to minimize redundant fetches

-   Fix for tags showing as blank or empty on initial load

**V1.31** strengthened the platform's **document handling** and **search efficiency**, laying groundwork for more advanced organizational features and smoother user interactions.
`,
    tags: ['Document Tagging', 'Caching Optimzation'],
  },
  v200: {
    title: 'V2.00 | S3 Porting',
    date: 'June 7th, 2025',
    author: 'Dev Patel',
    description: `
**Version 2.00** focused on finalizing the Cloudflare R2 migration, enhancing backend stability, and improving user experience through targeted UI and documentation updates.

This release completed the transition from **AWS S3** to **Cloudflare R2** storage with thorough code cleanup and optimizations. By continuing to leverage the AWS S3 SDK's compatibility with R2, the team minimized code disruptions and preserved the ability to revert if necessary. Additional backend refinements addressed edge cases such as handling empty folders gracefully, preventing errors and UI inconsistencies.

On the frontend, subtle but impactful **UI/UX layout tweaks** improved the visual polish and alignment of interface elements, addressing overlooked updates from prior releases to ensure consistency and responsiveness across devices.

Complementing these technical changes, the **release documentation component** was enhanced to provide clearer and more comprehensive information about upload functionalities and recent fixes. This update improves transparency for users and developers alike, aligning documentation closely with the evolving platform capabilities.

Key advantages of this release include:

-   **Stabilized Storage Integration**: Finalized migration to Cloudflare R2 ensures a robust, cost-effective backend with minimal code complexity.

-   **Improved Error Handling**: Enhanced logic around empty folder scenarios prevents UI disruptions and improves user confidence.

-   **Refined User Interface**: Focused layout adjustments enhance the platform's visual consistency and user experience.

-   **Up-to-Date Documentation**: More detailed release notes and upload feature descriptions facilitate smoother onboarding and troubleshooting.

**Version 2.00** represents a mature and stable iteration of the platform, reinforcing infrastructure reliability and user engagement while preparing for future enhancements and scaling opportunities.
`,
    tags: ['Team Development', 'AWS S3', 'Cloudflare R2'],
  },



};

const markdownComponents = {
  p: ({ node, ...props }) => <p style={{ color: '#2a2a2a' }} {...props} />,
  strong: ({ node, ...props }) => <strong style={{ color: '#2a2a2a' }} {...props} />,
  li: ({ node, ...props }) => <li style={{ color: '#2a2a2a' }} {...props} />,
  em: ({ node, ...props }) => <em style={{ color: '#2a2a2a' }} {...props} />

};

export default function ReleaseInfo() {
  const { versionId } = useParams();
  const data = releaseNotes[versionId];

  if (!data) {
    return <div className="container pt-5"><h2>Release version not found.</h2></div>;
  }

  return (
    <div className="container pt-5">
      <h1 className="primary">{data.title}</h1>
      <p className="text-muted">{data.date} | Author: {data.author}</p>
      <div className="d-flex flex-wrap mt-3">
        {data.tags.map((tag, i) => (
          <div key={i} className="interest-pill mx-1" style={{ fontSize: '12px' }}>
            {tag}
          </div>
        ))}
      </div>
      <div className="horizontal-line my-3"></div>
 
     <div className='box p-3' style={{ color: '#2a2a2a'  }}>
  <ReactMarkdown components={markdownComponents}>{data.description}</ReactMarkdown>
</div>
      
    </div>
  );
}
