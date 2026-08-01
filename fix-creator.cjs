const fs = require('fs');
let content = fs.readFileSync('src/components/CreatorWorkspace.tsx', 'utf8');

// Profile
content = content.replace(
  `  if (activeSubTab === 'profile') {\n    return (\n      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">`,
  `  const tabOrder = ['radar', 'escrow', 'wallet', 'portfolio', 'profile'];\n  const [prevTab, setPrevTab] = React.useState(activeSubTab);\n  const [direction, setDirection] = React.useState(1);\n  React.useEffect(() => {\n    if (activeSubTab !== prevTab) {\n      setDirection(tabOrder.indexOf(activeSubTab) > tabOrder.indexOf(prevTab) ? 1 : -1);\n      setPrevTab(activeSubTab);\n    }\n  }, [activeSubTab, prevTab]);\n\n  return (\n    <div className="relative w-full h-full">\n      <AnimatePresence mode="wait" custom={direction}>\n        <motion.div\n          key={activeSubTab}\n          custom={direction}\n          initial={{ opacity: 0, x: direction * 40 }}\n          animate={{ opacity: 1, x: 0 }}\n          exit={{ opacity: 0, x: direction * -40 }}\n          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}\n          className="w-full"\n        >\n          {activeSubTab === 'profile' && (\n            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">`
);

// End of Profile -> Radar
content = content.replace(
  `      </div>\n    );\n  }\n\n  if (activeSubTab === 'radar') {\n    return (\n      <>\n      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">`,
  `      </div>\n          )}\n\n          {activeSubTab === 'radar' && (\n            <>\n            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">`
);

// End of Radar -> Escrow
content = content.replace(
  `      </>\n    );\n  }\n\n  if (activeSubTab === 'escrow') {\n    const acceptedCampaigns = creatorCampaigns.filter(camp => {`,
  `      </>\n          )}\n\n          {activeSubTab === 'escrow' && (() => {\n            const acceptedCampaigns = creatorCampaigns.filter(camp => {`
);

content = content.replace(
  `      return hasBrandReviewOffer || hasAcceptedOffer || hasSubmission || isDatabaseAccepted;\n    });\n\n    return (\n      <div className="flex flex-col gap-6 animate-fade-in">`,
  `      return hasBrandReviewOffer || hasAcceptedOffer || hasSubmission || isDatabaseAccepted;\n    });\n\n            return (\n              <div className="flex flex-col gap-6">`
);

// End of Escrow -> Wallet
content = content.replace(
  `      </div>\n    );\n  }\n\n  if (activeSubTab === 'wallet') {\n    return (\n      <div className="flex flex-col gap-6 animate-fade-in">`,
  `      </div>\n            );\n          })()}\n\n          {activeSubTab === 'wallet' && (\n            <div className="flex flex-col gap-6">`
);

// End of Wallet -> Portfolio
content = content.replace(
  `      </div>\n    );\n  }\n\n  if (activeSubTab === 'portfolio') {\n    return (\n      <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-fade-in">`,
  `      </div>\n          )}\n\n          {activeSubTab === 'portfolio' && (\n            <div className="max-w-5xl mx-auto flex flex-col gap-8">`
);

// End of Portfolio
content = content.replace(
  `      </div>\n    );\n  }\n\n  return null;\n}`,
  `      </div>\n          )}\n        </motion.div>\n      </AnimatePresence>\n    </div>\n  );\n}`
);

fs.writeFileSync('src/components/CreatorWorkspace.tsx', content);
