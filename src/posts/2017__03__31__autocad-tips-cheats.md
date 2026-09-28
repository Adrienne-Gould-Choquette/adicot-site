---
layout: layouts/post.njk
title: "AutoCAD Tips & Cheats"
seoTitle: "AutoCAD Tips & Cheats"
description: "AutoCAD's capabilities are so vast, and finding solutions to problems can be an arduous task. This post lists useful AutoCAD Tips & Cheats."
date: 2017-03-01T15:31:00.000Z
permalink: /post/2017/03/31/autocad-tips-cheats.html
ogImage: "/images/0179db_bb013a7a8df543c39f9b2191a56f84e6~mv2_d_3024_4032_s_4_2.jpg"
categories: ["drafting-with-autocad"]
---

![Photograph of a Notebook with handwritten AutoCAD Tips & Cheats](/images/0179db_bb013a7a8df543c39f9b2191a56f84e6~mv2_d_3024_4032_s_4_2.jpg)

As a self-taught AutoCAD user, I learn everything by either stumbling upon something wonderful, or extensive research to find the solution to an obstacle. Since AutoCAD's capabilities are so vast, and finding solutions to problems can be an arduous task, I often write down obscure solutions (obscure to someone self-taught at least) which I will not use often enough to commit to memory but do not want to have to research again.

We are going hi-tech at Adicot! Since my cheat sheet is getting full and not conducive to sharing, I have included my favorite AutoCAD Tips & Cheats. If you have any great AutoCAD tips, please send them our way!

- Using the keyboard to enter commands instead of icons is much more efficient. Here is an extensive list of shortcuts: [Autodesk's AutoCAD keyboard shortcuts guide](https://www.autodesk.com/shortcuts/autocad)

But instead of trying to memorize shortcuts, think about what you want to do and begin typing.

![AutoCAD Hatch command](/images/0179db_0c0e9b25dcdf428cabbd2226703988a2~mv2.jpg)

Example: You want to hatch an area. You could try to memorize on which ribbon Hatch is located, or just start typing Hatch, and AutoCAD will give you a list of options. Select H (HATCH) from that list.

If you use HATCH frequently enough that it is worth committing to memory, AutoCAD has provided you the shortcut, H(HATCH); so next time type H at the command line and press Enter.

![AutoCAD LAYISO command](/images/0179db_f5928568e9614df5bae3b6dcafb65f76~mv2.jpg)

Example: I can never remember how to isolate a layer; is it ISOLAY, or LAYISO? It doesn’t matter, just start typing and AutoCAD will populate the list of possible options. In this case, I started typing ISO and LAYISO popped up. Select LAYISO from the list.

(Isolating a layer locks all other layers except the one selected; LAYUNISO restores all layers to their previous state)

If you do not immediately see the command you expected, the window that pops up is scrollable. See if the command you are looking for is further down the list.

This is also a good way to learn new commands since AutoCAD populates a list of commands using the letters you enter.

- Always with efficiency in mind, some commands you will just want to memorize. In almost every case I prefer to use MTEXT rather than TEXT because it is much more editable. How convenient that the command for MTEXT is simply T. Type T at the command line and press enter and you will begin creating an MTEXT object.

- Some commands that I use all the time or that took me forever to figure out once and that I never wanted to have to figure out again:

- CO: C(OPY) This works differently from the standard shortcut of Ctrl+C. COPY can only copy to the same drawing but will make multiple copies. Ctrl+C can copy to the same drawing or any other drawing file, but needs the Ctrl+V command to paste.

- Q: Q(SAVE) the drawing (SAVE is actually Save As where you can change the filename and the file location)

DIMSCALE: I always set DIMSCALE when starting a new drawing based on the following: [Design Master, "How to set DIMSCALE"](https://web.archive.org/web/20260419081554/https://www.designmaster.biz/support/QandA/HowtoSetDIMSCALE.html) (an archived copy; the original page has been taken down). This can help adjust size of text, leaderhead arrows, and other drawing elements.

LTSCALE: It is also a good idea to set LTSCALE using the same scale as DIMSCALE. I discovered LTSCALE when the “hidden” line type was not visible because LTSCALE was set too low.

Sometimes in an active drawing Z(OOM) > E(XTENTS), results in a blank screen with a small dot in the center. To get rid of this:

- Z(OOM)

- E(XTENTS)

- ERASE

- ALL

- R(EMOVE)

- Drag a window around the dot in the middle of the screen

- Enter

Now try Z(OOM) > E(XTENTS) again and the drawing should be as expected, rather than a small dot in the center of a black screen.

TXT2MTXT - Converts TEXT to MTEXT

MIRRTEXT

- 0: Will NOT mirror text

- 1: Will mirror text

PDFOSNAP

- 1: Will allow you to snap to objects in a pdf External Reference (XREF) object

IMAGEFRAME, PDFFRAME, DWFFRAME, DNGFRAME, XCLIPFRAME

- 0: Not visible, not printed

- 1: Visible and plots

- 2: Displays but does not print

- 3: Various

LAYFRZ: Freeze layer in a viewport - select the viewport for which you want this layer to be frozen

VPMAX: Expands the current layout viewport for editing

VPMIN: Restores the current layout viewport

![AutoCAD snap to Menu](/images/0179db_af19fb1d53b240cd8be26a1b0d3231fe~mv2.jpg)

Snap To Menu Shortcut: Ctrl + RightClick brings up the snap to menu, either click the snap type you need or in many instances, type the first letter of the snap type.

Examples:

E - Endpoint

M- Midpoint

P- Perpendicular

R- Near

C- Center

PURGE: Removes unused items, such as block definitions and layers, from the drawing

LAYMRG: merges selected layers into a target layer; the layer you select to merge into the target layer is deleted

QSELECT: Creates a selection set based on filtering criteria (Example: Select all text of a particular style)

![Blueprint drawing](/images/9aae58f8cb39c0432380467cfa4e74eb.jpg)

The Up Arrow scrolls through previously used commands at the command line. Once you get to the command you were looking for, press the Enter key to start that command.

Enter repeats the last command

FIELDEVAL: Decide when to update field values

At the Command prompt, enter fieldeval.

- Enter a bitcode that is the sum of any of the following values:

- 0: Not updated

- 1: Updated on open

- 2:Updated on save

- 4:Updated on plot

- 8:Updated on use of ETRANSMIT

- 16: Updated on regeneration

For example, to update fields only when the file is opened, saved, or plotted, enter 7. To update fields when any action from the above list occurs, enter 31.

FIND: Find (and Replace) Text in the File: At the command prompt, enter FIND to pull up the Find and Replace Dialog Box.

NUMBERING SHEETS: Use the Tab Name to Automatically Set the Sheet Name

From a layout tab, create a textbox where the sheet name/number should go. Click on the Field Icon in the Text Editor ribbon and select:

Field Category: Other

Field Names: SystemVariable

System variable: ctab

Format: Choose applicable options

#autocad #tips #cad #drafting #mtext #mechanicalengineer
