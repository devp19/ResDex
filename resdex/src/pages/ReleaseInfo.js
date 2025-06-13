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
  v200: {
    title: 'V2.00 | S3 Porting',
    date: 'June 5th, 2025',
    author: 'Dev Patel',
    description: `
**V2.00** marked a pivotal shift in both technical infrastructure and team development strategy.

This release introduced structured development workflows, enabling better task ownership, peer collaboration, and improved deployment pipelines. These changes helped reduce bottlenecks and increase velocity across feature development cycles.

A major upgrade in this version was the migration from **AWS S3** to **Cloudflare R2** for object storage. The transition was driven by multiple advantages:

- **Cost Efficiency**: Cloudflare R2 eliminates egress fees, offering significantly lower storage and bandwidth costs compared to AWS S3.
- **Performance Improvements**: With global edge caching and optimized delivery, file access latency was reduced for end users, especially in North America.
- **Simplified Access Control**: R2’s tight integration with Cloudflare’s zero-trust security tools enabled more streamlined permission management and audit logging.
- **Improved Scalability**: R2 offered a flat storage model with increased flexibility, helping prepare ResDex for high-volume uploads and downloads.
- **Vendor Consolidation**: By aligning with Cloudflare’s growing ecosystem, infrastructure became easier to manage and reduced operational complexity.

The release reflects a long-term investment in performance, maintainability, and developer productivity as ResDex continues to expand its feature set and user base.
`,
    tags: ['Team Development', 'AWS S3', 'Cloudflare R2'],
  },


v201: {
    title: 'V2.01 | Release Docs',
    date: 'June 13th, 2025',
    author: 'Tirth Patel',
    description: `
**Version 1.05** marked an important step in refining the platform's performance, visual coherence, and backend infrastructure in preparation for future scalability.

This release introduced key interface and deployment improvements to streamline both user experience and engineering workflows. Navigation was refined by reverting from text labels back to icon-based tabs, creating a cleaner and more consistent visual structure across devices. Development velocity also benefited from a round of deployment optimizations, including the removal of bulky and unused image assets that had previously inflated repository size and slowed down build processes.

The most significant upgrade in this version was the migration of object storage from **AWS S3** to **Cloudflare R2**, implemented using AWS SDK-compatible tooling. This transition introduced a more scalable and cost-efficient storage backend, while simplifying environment configuration and standardizing the storage layer across the codebase.

Key benefits of the migration included:

-   **Cost Efficiency**: Cloudflare R2 removes egress charges, providing more predictable and reduced storage and transfer costs compared to AWS S3.

-   **Standardized Configuration**: By moving endpoint and credential data to environment variables, the deployment process became more secure and flexible.

-   **Developer Simplicity**: Refactoring the file-handling logic and removing hardcoded values led to a cleaner codebase and easier future maintenance.

-   **Long-Term Scalability**: R2's flat object model and edge performance support higher volumes of file uploads and downloads without restructuring the backend.

Version 1.05 represents an incremental but foundational release, improving performance, deployment reliability, and backend maintainability---laying the groundwork for accelerated growth and new feature development in future versions.
`,
    tags: ['Release Docs', 'Documentation'],
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
