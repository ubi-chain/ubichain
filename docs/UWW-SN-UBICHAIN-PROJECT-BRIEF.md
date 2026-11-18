# UWW-SN / UBICHAIN — Project Brief

**Status:** Early-stage concept and prototype package (November 2026)  
**Prepared by:** UBICHAIN project owner  
**Purpose:** Request for feedback and guidance; this is not a claim of MIT affiliation, endorsement, or a completed research result.

## Overview

UBICHAIN is proposed as a foundational identity, policy, data-management, and service-coordination layer for the Universal Wide Web (UWW). UWW is envisioned as an accessible, interoperable 3D web environment for social spaces, games, learning, creative tools, community services, and optional private/quiet spaces.

UWW-SN (Universal Wide Web Satellite Network) is a proposed connectivity architecture for UWW. The current concept is **limited-connectivity**, not fully isolated: external networks and satellite services may be used through controlled gateways, with explicit separation between user-facing services and sensitive operational/control systems.

## Architecture direction

- Start with terrestrial connectivity and existing satellite providers through a provider-neutral gateway.
- Research independent satellite capability as a separate, longer-term workstream; do not assume an owned satellite constellation is required for the first prototype.
- Separate identity, core services, user worlds, data services, administration, and gateway/DMZ zones.
- Use established standards and protocols where appropriate, including IPv6, TLS 1.3, mutual TLS, IPsec or WireGuard, and DTN / Bundle Protocol for disruption-tolerant links.
- Consider CCSDS standards only where they fit the space-link segment and the mission architecture.
- Keep satellite command-and-control systems separate from public application services.

## UWW experience

The proposed world includes a plaza, personal home spaces, games, creator tools, learning spaces, community areas, quiet zones, and nature environments. Users may create avatars, objects, environments, and games. Accessibility and support for lower-performance devices are design priorities.

## Security and trust

The design follows defense in depth: least privilege, default-deny network policy, encryption in transit, device identity, short-lived credentials, audit trails, segmentation, signed updates, backups, recovery procedures, and sandboxing for extensions. Satellite connectivity is not described as inherently secure or hack-proof.

The reference to **fox-os-private** is limited to a defensive administration / incident-response workstation concept: isolating suspected infected endpoints, preserving logs and evidence, and supporting trusted recovery. It is not intended as an offensive hacking environment. Its provenance and operational suitability must be independently verified before deployment.

## Prototype status and limitations

The accompanying QAN files are provisional templates based on the project owner's supplied examples. A complete formal grammar, parser, runtime, and conformance tests have not yet been established. The included server code is a local development sample, not production infrastructure. The economic model is a non-monetary simulation only; it does not process real payments or promise returns.

No satellite has been launched or built as part of this project. Any orbital demonstrator would require feasibility studies, spectrum/licensing review, ground-segment planning, launch arrangements, safety review, and qualified engineering partners.

## Requested feedback

1. Which research questions would be most valuable to scope first: secure federated networking, delay/disruption-tolerant networking, identity and trust, or accessible 3D interaction?
2. What would be an appropriate pathway for an independent early-stage project to seek academic feedback or collaboration?
3. Which established standards, testbeds, or research groups would be relevant?

## Links

- GitHub project repository: https://github.com/ubi-chain/ubichain
- UBICHAIN Grok mockup: https://sail-daisy-earth-bison.grok.me
- Additional UWW / IETFUBI Grok mockup: https://velvet-spark-prism-cabin.grok.me/

These Grok links are concept mockups and may change; they are not presented as production deployments.

## License and reuse

The repository's project materials are shared for review. No open-source license is granted by this brief unless a separate LICENSE file explicitly says otherwise. Please contact the project owner before reusing or redistributing materials.
