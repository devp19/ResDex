import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';


const releaseNotes = {
  v100: {
    title: 'V1.00 | Initial',
    date: 'August 23rd, 2024',
    author: 'Dev Patel',
    description:
      'V1.00 marked the initial project kickoff, establishing the core vision for ResDex and outlining the foundational architecture for future development.',
    tags: ['General Development'],
  },
  v101: {
    title: 'V1.01 | App Configuration',
    date: 'September 10th, 2024',
    author: 'Dev Patel',
    description:
      'V1.01 added support for custom domain configuration, improved error handling across the app, and optimized backend API response times.',
    tags: ['Domain', 'Backend API'],
  },
  v102: {
    title: 'V1.02 | User Development',
    date: 'October 2nd, 2024',
    author: 'Dev Patel',
    description:
      'V1.02 implemented role-based access controls, enhanced PDF viewing performance, and added basic audit logging for user activity.',
    tags: ['PDF Performance', 'Role-Based Access', 'Audit Logging'],
  },
  v103: {
    title: 'V1.03 | Web-Interactivity',
    date: 'November 5th, 2024',
    author: 'Dev Patel',
    description:
      'V1.03 introduced user authentication, file upload functionality, and initial integration with Cloudflare R2 for storage.',
    tags: ['Authentication', 'Upload', 'Cloudflare R2'],
  },
  v104: {
    title: 'V1.04 | UI/UX Improvements',
    date: 'January 29th, 2025',
    author: 'Tirth Patel',
    description:
      `**V1.04** focused on enhancing user collaboration, streamlining connection logic, and polishing the overall user experience through targeted UI/UX refinements.

This version introduced foundational upgrades to the collaborative research workflow. A key feature was the rollout of a **real-time collaborator selector** in the document creation component, allowing users to invite connections (now referred to as **Research Fellows**) directly into shared workspaces. The selector dynamically pulls profile data---names and profile images---from the user's connection list, making collaboration more intuitive and personal.

Connection logic also underwent a strategic overhaul. The previous "Follow/Following" system was merged and redesigned to align more closely with **LinkedIn-style connections**, where both users must follow each other to become collaborators. This change sets the groundwork for more secure and reciprocal academic networking.

From a design and usability perspective, **contact and upload interfaces received a visual refresh**. This included smoother transitions, fade-in animations for headers, and updated containers to create a more polished and responsive feel. Additionally, a **new PDF upload theme** was introduced to improve clarity and consistency across file interactions.

Other notable improvements:

-   **Renamed "Followers" to "Research Fellows"** to better reflect academic and professional context

-   **Refactored form logic** in document creation to properly capture and store title, description, interests, and collaborator data

-   **UI responsiveness updates** across form inputs, buttons, and dropdowns

-   **Bug fixes** related to sizing inconsistencies across devices and browsers

**V1.04** represents a step toward a more collaborative and user-centered platform, laying the groundwork for scalable research teamwork and deeper social functionality.
`,
    tags: ['Collaboration Features', 'System & Logic Enhancements'],
  },
  v105: {
    title: 'V1.05 | Platform Optimization',
    date: 'April 29th, 2025',
    author: 'Tirth Patel',
    description:
      `**V1.05** emphasized interface consistency, backend infrastructure migration, and codebase optimization to enhance performance and maintainability.

This version introduced a **UI refinement by reverting the Navbar from text labels back to icons**, improving visual consistency and aligning with user expectations for a cleaner navigation experience.

A significant technical milestone in this release was the **migration of the storage backend from AWS S3 to Cloudflare R2**, leveraging AWS SDK compatibility for a smooth transition. This migration included:

-   Addition of a new Cloudflare configuration file managing R2 credentials and endpoints securely through environment variables.

-   Updates to imports in key components such as **PDFUpload.js** and **Profile.js** to replace AWS clients with the Cloudflare S3-compatible client.

-   Removal of hardcoded AWS endpoints and bucket names, standardizing storage access for Cloudflare R2.

This backend change improves cost efficiency, scalability, and integration with the Cloudflare ecosystem, setting the stage for future enhancements in storage management.

Additionally, **deployment fixes and image asset cleanup** were carried out to reduce repository bloat by removing unused or bulky images. This cleanup streamlines development workflows and improves overall application performance.

Other highlights include:

-   Updated copyright information to maintain legal and branding accuracy.

-   Various bug fixes and optimizations ensuring smoother deployment and resource management.

**V1.05** strengthens the platform's foundation by balancing front-end polish with backend modernization, enhancing both user experience and operational efficiency.
`,
    tags: ['UI Refinements', 'Storage Migration', 'Codebase Cleanup'],
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
